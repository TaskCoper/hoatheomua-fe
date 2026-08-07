import { readSessionHint } from '@/shared/session-hint'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import authService from '../services'

const noop = () => () => {}

// Prerendered/ISR HTML is shared by every visitor, so it can only ever show the
// signed-out header. The hint is re-read on the client, and any render after
// sign-in picks the new value up because React calls `getSnapshot` each render.
const serverSessionHint = () => false

export const useGetMe = () => {
  const hasSessionHint = useSyncExternalStore(noop, readSessionHint, serverSessionHint)

  const {
    data: me,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    // Without a session cookie there is nobody to fetch: the request would 401
    // with `MissingAccessToken` and drag a doomed token refresh along with it.
    // Cached data still reads through, so the `setQueryData(['me'])` that
    // `useSignIn` performs is visible here before the cookie round-trips.
    enabled: hasSessionHint
  })

  // `isLoading` rather than `isPending`: a disabled query stays `pending`
  // forever, which would pin the header on its loading skeleton for every
  // anonymous visitor.
  const isGettingMe = isLoading || (isFetching && !me)

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
