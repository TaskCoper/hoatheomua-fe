import { routing } from '@/lib/i18n/routing'

export type AuthPath = '/sign-in'

export const toBrowserPath = (path: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return path
  }

  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
    return path
  }

  return `/${locale}${path}`
}

export const isSafeInternalPath = (path: string | null): path is string => {
  if (typeof window === 'undefined') return false
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false
  try {
    return new URL(path, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

export const getAuthRedirectTarget = (from: string | null) => (isSafeInternalPath(from) ? from : '/')

export const buildAuthHref = (path: AuthPath, from: string | null | undefined) =>
  from ? { pathname: path, query: { from } } : path
