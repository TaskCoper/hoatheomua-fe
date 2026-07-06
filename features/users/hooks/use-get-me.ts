import { hasSessionCookieClient } from '@/lib/has-session'
import { useQuery } from '@tanstack/react-query'
import { getMeQuery } from '../queries'

export const useGetMe = () => {
  const hasSession = hasSessionCookieClient()

  const {
    data,
    isPending,
    isFetching,
    fetchStatus
  } = useQuery({
    ...getMeQuery(),
    retry: false,
    throwOnError: false,
    enabled: hasSession
  })

  const me = hasSession ? data : null
  const isGettingMe = hasSession && (fetchStatus === 'fetching' || (isPending && fetchStatus !== 'idle') || isFetching)

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
