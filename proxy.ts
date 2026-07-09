import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'
import { GUEST_ONLY_ROUTES, isPublicRoutePath } from './shared/constants'

const ACCESS_TOKEN_COOKIE = 'HTM-Access-Token'
const REFRESH_TOKEN_COOKIE = 'HTM-Refresh-Token'

const intlMiddleware = createIntlMiddleware(routing)
const LOCALES = routing.locales as readonly string[]

const stripLocale = (pathname: string) => {
  const [, maybeLocale, ...rest] = pathname.split('/')
  const stripped = LOCALES.includes(maybeLocale) ? `/${rest.join('/')}` : pathname
  const normalized = stripped.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

const getLocalePrefix = (pathname: string) => {
  const [, maybeLocale] = pathname.split('/')
  return LOCALES.includes(maybeLocale) ? `/${maybeLocale}` : ''
}

const buildRedirect = (request: NextRequest, target: string, search?: URLSearchParams) => {
  const url = request.nextUrl.clone()
  url.pathname = `${getLocalePrefix(request.nextUrl.pathname)}${target}`
  url.search = search ? `?${search.toString()}` : ''
  return NextResponse.redirect(url)
}

export default function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse
  }

  const pathname = stripLocale(request.nextUrl.pathname)
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE)
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)

  const isProbablyAuthed = hasAccessToken || hasRefreshToken

  if (GUEST_ONLY_ROUTES.has(pathname) && isProbablyAuthed) {
    return buildRedirect(request, '/')
  }

  if (!isPublicRoutePath(pathname) && !isProbablyAuthed) {
    const params = new URLSearchParams({ from: request.nextUrl.pathname })
    return buildRedirect(request, '/sign-in', params)
  }

  return intlResponse
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}
