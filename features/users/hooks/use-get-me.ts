import { hasSessionMarker } from '@/lib/session-marker'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { getMeQuery } from '../queries'

const subscribeStub = () => () => {}
const getServerSnapshot = () => false

export const useGetMe = () => {
  const enabled = useSyncExternalStore(subscribeStub, hasSessionMarker, getServerSnapshot)

  const {
    data: me,
    isPending,
    isFetching
  } = useQuery({
    ...getMeQuery(),
    retry: false,
    throwOnError: false,
    enabled
  })

  // When the query is disabled we're definitely not fetching, so treat the
  // hook as "settled with no user" — otherwise consumers would show a loading
  // skeleton indefinitely for anonymous visitors.
  //
  // When enabled: `isPending` covers the initial fetch (no cached data yet).
  // `isFetching` covers background refetches — without this, guards briefly
  // observe a stale cached `null` (from a pre-sign-in 401) *while the refetch
  // is in flight* and bounce the user to /sign-in before the new `me` lands.
  const isGettingMe = enabled && (isPending || isFetching)

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
