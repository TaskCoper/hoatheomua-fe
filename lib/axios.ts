import { isPublicRoutePath } from '@/shared/constants'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface ApiResponse {
  isSuccess: boolean
  isFailed: boolean
  error: unknown
  traceId: string
  timestampUtc: string
}

export interface BaseResponse<T> extends ApiResponse {
  value: T
}

export interface BasePaginationResponse<T> extends ApiResponse {
  value: {
    items: T[]
    pageIndex: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ErrorResponse {
  title: string
  status: number
  detail: string
  messageCode: string
  errors: {
    detail: string
  }
  traceId: string
  timestampUtc: string
}

const SUPPORTED_LOCALES = ['vi', 'en'] as const
const DEFAULT_LOCALE = 'vi'
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const isSupportedLocale = (value: string): value is SupportedLocale => {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}

const isCurrentPublicRoutePath = (pathname: string) => {
  const [, maybeLocale, ...segments] = pathname.split('/')
  const pathnameWithoutLocale = isSupportedLocale(maybeLocale) ? `/${segments.join('/')}` : pathname

  return isPublicRoutePath(pathnameWithoutLocale)
}

const getCurrentLanguage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const [, locale] = window.location.pathname.split('/')

  if (isSupportedLocale(locale)) {
    return locale
  }

  const documentLanguage = document.documentElement.lang

  return isSupportedLocale(documentLanguage) ? documentLanguage : DEFAULT_LOCALE
}

const getCurrentTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, item)
        })
      } else {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }
})

api.interceptors.request.use((config) => {
  const currentLanguage = getCurrentLanguage()

  config.headers['Accept-Language'] = currentLanguage
  config.headers['X-Timezone'] = getCurrentTimezone()

  return config
})

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    await axios.post(
      '/api/v1/auth/refresh',
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': getCurrentLanguage(),
          'X-Timezone': getCurrentTimezone()
        }
      }
    )

    return true
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>

    // If refresh token is invalid
    if (error.response?.data?.messageCode === 'EXPIRED_REFRESH_TOKEN') {
      // TODO: clear all zustand persisted states here
      const isOnPublicRoute = isCurrentPublicRoutePath(window.location.pathname)

      // Avoid hard-reload loops when a protected call is made from public pages.
      if (!isOnPublicRoute) {
        window.location.replace('/sign-in')
      }
    }

    return false
  }
}

let isRefreshing = false
let refreshSubscribers: ((error: AxiosError | null) => void)[] = []

const subscribeTokenRefresh = (cb: (error: AxiosError | null) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (error: AxiosError | null = null) => {
  refreshSubscribers.forEach((cb) => cb(error))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status
    const messageCode = (error.response?.data as ErrorResponse)?.messageCode

    const isExpiredAccessToken =
      status === 401 && (messageCode === 'EXPIRED_ACCESS_TOKEN' || messageCode === 'MISSING_ACCESS_TOKEN')
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')

    if (!originalRequest || !isExpiredAccessToken || isRefreshRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // If a refresh is already in progress, wait for it to finish then retry
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((err) => {
          // Updated: Reject the promise if the refresh failed
          if (err) {
            return reject(err)
          }
          // After the token is refreshed, retry the original request.
          // The browser will automatically use the newly set cookie.
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true

    const isRefreshSuccessful = await refreshAccessToken()

    isRefreshing = false

    if (!isRefreshSuccessful) {
      // Notify queued requests that the refresh failed
      onRefreshed(error)
      return Promise.reject(error)
    }

    // Notify queued requests of success
    onRefreshed(null)

    // Retry the original request. The browser will automatically use the newly set cookie.
    return api(originalRequest)
  }
)

export default api
