export const DEFAULT_PAGE_INDEX = 1
export const DEFAULT_PAGE_SIZE = 10

export const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export const PUBLIC_ROUTE_PATHS = new Set([
  '/',
  '/sign-in',
  '/sign-up',
  '/verify',
  '/verify-sent',
  '/news',
  '/products',
  '/products/[id]'
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
