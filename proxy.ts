import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'
import { isPublicRoutePath, SESSION_HINT_COOKIE } from './shared/constants'
import { isOrderingBlockedPath, ORDERING_DISABLED_REDIRECT_PATH } from './shared/feature-flags'

const ACCESS_TOKEN_COOKIE = 'accessToken'
const REFRESH_TOKEN_COOKIE = 'refreshToken'

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

const isPrefetchRequest = (request: NextRequest) =>
  request.headers.get('next-router-prefetch') === '1' ||
  request.headers.has('next-router-segment-prefetch') ||
  request.headers.get('purpose') === 'prefetch' ||
  request.headers.get('sec-purpose')?.includes('prefetch') === true

const withSessionHint = <T extends NextResponse>(response: T, isProbablyAuthed: boolean): T => {
  if (isProbablyAuthed) {
    response.cookies.set(SESSION_HINT_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
  } else {
    response.cookies.set(SESSION_HINT_COOKIE, '', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0
    })
  }

  return response
}

export default function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE)
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)

  const isProbablyAuthed = hasAccessToken || hasRefreshToken

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return withSessionHint(intlResponse, isProbablyAuthed)
  }

  const pathname = stripLocale(request.nextUrl.pathname)
  const isPrefetch = isPrefetchRequest(request)

  // A cookie can be expired or revoked. AuthGuard redirects signed-in visitors
  // only after /me succeeds, so stale cookies cannot bounce sign-in back home.

  if (isOrderingBlockedPath(pathname) && !isPrefetch) {
    return withSessionHint(buildRedirect(request, ORDERING_DISABLED_REDIRECT_PATH), isProbablyAuthed)
  }

  if (!isPublicRoutePath(pathname) && !isProbablyAuthed && !isPrefetch) {
    const params = new URLSearchParams({ from: `${request.nextUrl.pathname}${request.nextUrl.search}` })
    return withSessionHint(buildRedirect(request, '/sign-in', params), isProbablyAuthed)
  }

  return withSessionHint(intlResponse, isProbablyAuthed)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}
