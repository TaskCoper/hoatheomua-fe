import { useQuery } from '@tanstack/react-query'
import { getMeQuery } from '../queries'

export const useGetMe = () => {
  const {
    data: me,
    isPending,
    isFetching
  } = useQuery({
    ...getMeQuery(),
    retry: false,
    throwOnError: false
  })

  // `isPending` covers the initial fetch (no cached data yet). `isFetching`
  // covers background refetches — without this, guards briefly observe a
  // stale cached `null` (from a pre-sign-in 401) *while the refetch is in
  // flight* and bounce the user to /sign-in before the new `me` lands.
  const isGettingMe = isPending || isFetching

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
