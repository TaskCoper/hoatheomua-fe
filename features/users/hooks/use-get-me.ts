import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import authService from '../services'

export const useGetMe = () => {
  const {
    data: me,
    isPending,
    isFetching
  } = useQuery({
    queryKey: ['me'],
    // Treat 401 as a successful "no session" result so React Query caches it
    // and observer remounts don't keep refiring /me → /refresh_token.
    queryFn: async () => {
      try {
        return await authService.getMe()
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
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
