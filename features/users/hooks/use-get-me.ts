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

  const isGettingMe = isPending || isFetching

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
