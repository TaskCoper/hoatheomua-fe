import { readSessionHint, subscribeToSessionHint } from '@/shared/session-hint'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import authService from '../services'

const serverSessionHint = () => false

export const useGetMe = () => {
  const hasSessionHint = useSyncExternalStore(subscribeToSessionHint, readSessionHint, serverSessionHint)

  const {
    data: me,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: hasSessionHint
  })

  const isGettingMe = isLoading || (isFetching && !me)

  const isAuthenticated = hasSessionHint && !!me
  const isVerificationRequired = isAuthenticated && me?.isEmailVerified === false

  return { me, isGettingMe, isAuthenticated, isVerificationRequired }
}
