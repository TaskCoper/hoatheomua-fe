import { readSessionHint, subscribeToSessionHint } from '@/shared/session-hint'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { getMeQuery } from '../queries'

const serverSessionHint = () => false

export const useGetMe = () => {
  const hasSessionHint = useSyncExternalStore(subscribeToSessionHint, readSessionHint, serverSessionHint)

  const {
    data: me,
    isLoading,
    isFetching
  } = useQuery({
    ...getMeQuery(),
    enabled: hasSessionHint
  })

  const isGettingMe = isLoading || (isFetching && !me)

  const isAuthenticated = hasSessionHint && !!me
  // Keep existing eligible sessions usable; new sign-ins only use phone authentication.
  const canUseStorefront = isAuthenticated && !!(me?.canUseStorefront || me?.isEmailVerified)

  return { me, isGettingMe, isAuthenticated, canUseStorefront }
}
