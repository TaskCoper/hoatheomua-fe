import { useQuery } from '@tanstack/react-query'
import authService from '../services'

export const useGetMe = () => {
  const {
    data: me,
    isLoading: isGettingMe,
    isError
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    retry: false
  })

  const isAuthenticated = !!me && !isError
  const isVerificationRequired = !!me && me.isVerify === false

  return { me, isGettingMe, isError, isAuthenticated, isVerificationRequired }
}
