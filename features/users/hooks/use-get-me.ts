import { useQuery } from '@tanstack/react-query'
import authService from '../services'

export const useGetMe = () => {
  const {
    data: me,
    isPending,
    isFetching
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe
  })

  const isGettingMe = isPending || isFetching

  const isAuthenticated = !!me
  const isVerificationRequired = !!me && me.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
