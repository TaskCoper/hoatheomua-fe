export const DEFAULT_PAGE_INDEX = 1
export const DEFAULT_PAGE_SIZE = 10

export const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Readable-by-JS mirror of the HttpOnly auth cookies. The client cannot see
// `accessToken`/`refreshToken`, so this is the only way for `useGetMe` to know
// whether there is a session worth fetching. Written by the middleware on every
// navigation (see proxy.ts) and, so sign-in/sign-out do not have to wait for a
// middleware round-trip, by the auth mutations themselves.
export const SESSION_HINT_COOKIE = 'hasSession'

export const PUBLIC_ROUTE_PATHS = new Set([
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-sent',
  '/news',
  '/news/[id]',
  '/products',
  '/products/[id]',
  '/about',
  '/recruitment',
  '/recruitment/[slug]',
  '/contact',
  '/b2b',
  '/b2b/[service]',
  '/terms',
  '/privacy',
  '/returns',
  '/delivery',
  '/ordering',
  '/occasions/[id]',
  '/featured/[id]',
  '/mainline/[id]',
  '/hoa-20-10'
])

const normalizeRoutePath = (pathname: string) => {
  if (pathname === '/') {
    return pathname
  }

  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

const isDynamicRouteSegment = (segment: string) => {
  return segment.startsWith('[') && segment.endsWith(']')
}

const routePathMatches = (routePath: string, pathname: string) => {
  const routeSegments = normalizeRoutePath(routePath).split('/').filter(Boolean)
  const pathnameSegments = normalizeRoutePath(pathname).split('/').filter(Boolean)

  if (routeSegments.length !== pathnameSegments.length) {
    return false
  }

  return routeSegments.every((routeSegment, index) => {
    return routeSegment === pathnameSegments[index] || isDynamicRouteSegment(routeSegment)
  })
}

export const isPublicRoutePath = (pathname: string) => {
  const normalizedPathname = normalizeRoutePath(pathname)

  if (PUBLIC_ROUTE_PATHS.has(normalizedPathname)) {
    return true
  }

  return Array.from(PUBLIC_ROUTE_PATHS).some((routePath) => routePathMatches(routePath, normalizedPathname))
}

export const GUEST_ONLY_ROUTES = new Set<string>(['/sign-in', '/sign-up'])

const GUEST_AUTH_PATH_PREFIXES = ['/sign-in', '/sign-up', '/forgot-password', '/verify'] as const

export const isGuestAuthPath = (pathname: string) => {
  return GUEST_AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
