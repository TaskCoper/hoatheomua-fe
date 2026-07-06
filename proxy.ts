import { SESSION_MARKER_COOKIE } from '@/lib/has-session'
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'
import { GUEST_ONLY_ROUTES } from './shared/constants'

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

const applySessionMarker = (response: NextResponse, hasSession: boolean) => {
  if (hasSession) {
    response.cookies.set(SESSION_MARKER_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    })
  } else {
    response.cookies.set(SESSION_MARKER_COOKIE, '', {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
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
    return applySessionMarker(intlResponse, isProbablyAuthed)
  }

  const pathname = stripLocale(request.nextUrl.pathname)

  if (GUEST_ONLY_ROUTES.has(pathname) && isProbablyAuthed) {
    return applySessionMarker(buildRedirect(request, '/'), isProbablyAuthed)
  }

  return applySessionMarker(intlResponse, isProbablyAuthed)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}
