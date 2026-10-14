import { usePathname } from '@/lib/i18n/navigation'
import { isGuestAuthPath } from '@/shared/constants'
import { useSearchParams } from 'next/navigation'
import { buildAuthHref, type AuthPath } from '../auth-redirect'

/** Links to an auth page and comes back to the current page afterwards. */
export const useAuthHref = (path: AuthPath) => {
  const pathname = usePathname()

  return buildAuthHref(path, isGuestAuthPath(pathname) ? null : pathname)
}

/** Moves between auth pages while keeping the page the visitor started from. */
export const useForwardedAuthHref = (path: AuthPath) => {
  const searchParams = useSearchParams()

  return buildAuthHref(path, searchParams.get('from'))
}
