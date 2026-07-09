import { hasSessionCookieClient } from '@/lib/has-session'
import { isPublicRoutePath } from '@/shared/constants'
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

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

const isBrowser = () => typeof window !== 'undefined'

const isCurrentPublicRoutePath = (pathname: string) => {
  const [, maybeLocale, ...segments] = pathname.split('/')
  const pathnameWithoutLocale = isSupportedLocale(maybeLocale) ? `/${segments.join('/')}` : pathname
  return isPublicRoutePath(pathnameWithoutLocale)
}

const getCurrentLanguage = () => {
  if (!isBrowser()) {
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

// Shared across every client so concurrent 401s anywhere only trigger one refresh.
let isRefreshing = false
let refreshSubscribers: ((error: AxiosError | null) => void)[] = []

const subscribeTokenRefresh = (cb: (error: AxiosError | null) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (error: AxiosError | null = null) => {
  refreshSubscribers.forEach((cb) => cb(error))
  refreshSubscribers = []
}

const refreshAccessToken = async (
  refreshTokenUrl: string,
  expiredRefreshTokenCodes: readonly string[]
): Promise<boolean> => {
  try {
    await axios.post(
      refreshTokenUrl,
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

    if (
      isBrowser() &&
      error.response?.data?.messageCode &&
      expiredRefreshTokenCodes.includes(error.response.data.messageCode)
    ) {
      const isOnPublicRoute = isCurrentPublicRoutePath(window.location.pathname)

      if (!isOnPublicRoute) {
        window.location.replace('/sign-in')
      }
    }

    return false
  }
}

interface CreateApiClientOptions {
  refreshTokenPath: string
  expiredAccessTokenCodes: readonly string[]
  expiredRefreshTokenCodes: readonly string[]
  serverBaseURL?: string
}

export const createApiClient = (
  baseURL: string,
  { refreshTokenPath, expiredAccessTokenCodes, expiredRefreshTokenCodes, serverBaseURL }: CreateApiClientOptions
): AxiosInstance => {
  const resolvedBaseURL = isBrowser() ? baseURL : (serverBaseURL?.replace(/\/+$/, '') ?? baseURL)
  const refreshTokenUrl = `${resolvedBaseURL}${refreshTokenPath}`

  const instance = axios.create({
    baseURL: resolvedBaseURL,
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

  instance.interceptors.request.use((config) => {
    if (isBrowser()) {
      if (!config.headers['Accept-Language']) {
        config.headers['Accept-Language'] = getCurrentLanguage()
      }
      if (!config.headers['X-Timezone']) {
        config.headers['X-Timezone'] = getCurrentTimezone()
      }
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      const status = error.response?.status
      const messageCode = (error.response?.data as ErrorResponse)?.messageCode

      const isExpiredAccessToken = status === 401 && !!messageCode && expiredAccessTokenCodes.includes(messageCode)
      const isRefreshRequest = originalRequest.url?.includes(refreshTokenPath)

      // No silent refresh on the server: there are no cookies to update on the
      // user's browser from here, and a redirect isn't possible. Let the caller
      // (Server Component / *.server.ts fetcher) decide what to do with the 401.
      if (!isBrowser() || !originalRequest || !isExpiredAccessToken || isRefreshRequest) {
        return Promise.reject(error)
      }

      // Anonymous visitors have no session to refresh — short-circuit before
      // triggering /refresh_token so public pages don't fire a noisy 401.
      if (!hasSessionCookieClient()) {
        return Promise.reject(error)
      }

      if (originalRequest._retry) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((err) => {
            if (err) {
              return reject(err)
            }
            resolve(instance(originalRequest))
          })
        })
      }

      isRefreshing = true

      const isRefreshSuccessful = await refreshAccessToken(refreshTokenUrl, expiredRefreshTokenCodes)

      isRefreshing = false

      if (!isRefreshSuccessful) {
        onRefreshed(error)
        return Promise.reject(error)
      }

      onRefreshed(null)

      return instance(originalRequest)
    }
  )

  return instance
}

const AUTH_TOKEN_CODES = {
  // Only these codes justify a silent refresh — MissingAccessToken means the
  // caller was anonymous, which is not a refresh candidate.
  expiredAccessTokenCodes: ['ExpiredAccessToken', 'InvalidAccessToken', 'MissingAccessToken'],
  expiredRefreshTokenCodes: ['InvalidRefreshToken']
} as const

const TASKCOPER_REFRESH_TOKEN_PATH = '/taskcoper/v1/users/refresh_token'

export const localeHeaders = (locale: string) => ({ 'Accept-Language': locale })

export const api = createApiClient('/api', {
  refreshTokenPath: TASKCOPER_REFRESH_TOKEN_PATH,
  serverBaseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  ...AUTH_TOKEN_CODES
})

export const apiTaskcoper = createApiClient('/api/taskcoper', {
  refreshTokenPath: '/v1/users/refresh_token',
  serverBaseURL: process.env.NEXT_PUBLIC_TASKCOPER_API_BASE_URL,
  ...AUTH_TOKEN_CODES
})

export default api
