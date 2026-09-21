import { isPublicRoutePath } from '@/shared/constants'
import { clearSessionHint } from '@/shared/session-hint'
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
      // The session is gone for good - drop the hint so `useGetMe` stops firing
      // requests that can only 401 until the next navigation refreshes it.
      clearSessionHint()

      const isOnPublicRoute = isCurrentPublicRoutePath(window.location.pathname)

      if (!isOnPublicRoute) {
        window.location.replace('/sign-in')
      }
    }

    return false
  }
}

const BROWSER_TIMEOUT = 15_000
const SERVER_TIMEOUT = 20_000

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])
const RETRYABLE_CODES = new Set([
  'ECONNABORTED',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENOTFOUND',
  'EPIPE',
  'ERR_NETWORK'
])
const MAX_SERVER_RETRIES = 2
const MAX_RATE_LIMIT_RETRIES = 1
const RETRY_BASE_DELAY = 500
const MAX_RETRY_AFTER_DELAY = 65_000

const isIdempotentMethod = (method?: string) => {
  const normalized = method?.toLowerCase()
  return normalized === 'get' || normalized === 'head' || normalized === 'options'
}

const isTransientError = (error: AxiosError) => {
  const status = error.response?.status

  if (status) {
    return RETRYABLE_STATUSES.has(status)
  }

  return !!error.code && RETRYABLE_CODES.has(error.code)
}

const parseRetryAfter = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const seconds = Number(value)

  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000)
  }

  const timestamp = Date.parse(String(value))

  return Number.isNaN(timestamp) ? null : Math.max(0, timestamp - Date.now())
}

const getRetryDelay = (error: AxiosError, attempt: number) => {
  const retryAfter = parseRetryAfter(error.response?.headers?.['retry-after'])

  if (retryAfter !== null) {
    return Math.min(retryAfter, MAX_RETRY_AFTER_DELAY)
  }

  return RETRY_BASE_DELAY * 2 ** attempt + Math.random() * 250
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
    timeout: isBrowser() ? BROWSER_TIMEOUT : SERVER_TIMEOUT,
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
    if (!isBrowser()) {
      console.log(
        `[REQLOG] pid=${process.pid} phase=${process.env.NEXT_PHASE ?? 'unset'} ${config.method} ${config.baseURL ?? ''}${config.url}`
      )
    }
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
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
        _retryCount?: number
      }
      const status = error.response?.status
      const messageCode = (error.response?.data as ErrorResponse)?.messageCode

      if (!isBrowser() && originalRequest && isIdempotentMethod(originalRequest.method) && isTransientError(error)) {
        const attempt = originalRequest._retryCount ?? 0
        const maxRetries = status === 429 ? MAX_RATE_LIMIT_RETRIES : MAX_SERVER_RETRIES

        if (attempt < maxRetries) {
          originalRequest._retryCount = attempt + 1

          await wait(getRetryDelay(error, attempt))

          return instance.request(originalRequest)
        }
      }

      const isExpiredAccessToken = status === 401 && !!messageCode && expiredAccessTokenCodes.includes(messageCode)
      const isRefreshRequest = originalRequest.url?.includes(refreshTokenPath)

      if (!isBrowser() || !originalRequest || !isExpiredAccessToken || isRefreshRequest) {
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
  expiredAccessTokenCodes: ['ExpiredAccessToken', 'MissingAccessToken'],
  expiredRefreshTokenCodes: ['InvalidRefreshToken']
} as const

const TASKCOPER_REFRESH_TOKEN_PATH = '/taskcoper/v1/users/refresh_token'

export const localeHeaders = (locale: string) => ({ 'Accept-Language': locale })

export const api = createApiClient('/api', {
  refreshTokenPath: TASKCOPER_REFRESH_TOKEN_PATH,
  serverBaseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  ...AUTH_TOKEN_CODES
})

// Flower creation and regeneration include two sequential AI image calls.
api.interceptors.request.use((config) => {
  const pathname = new URL(config.url ?? '', 'http://localhost').pathname
  const isFlowerGeneration =
    config.method?.toLowerCase() === 'post' && /^\/(?:api\/)?v1\/ai-flowers(?:\/[^/]+\/regenerate)?\/?$/.test(pathname)

  if (isFlowerGeneration) {
    config.timeout = 120_000
  }

  return config
})

export const apiTaskcoper = createApiClient('/api/taskcoper', {
  refreshTokenPath: '/v1/users/refresh_token',
  serverBaseURL: process.env.NEXT_PUBLIC_TASKCOPER_API_BASE_URL,
  ...AUTH_TOKEN_CODES
})

export default api
