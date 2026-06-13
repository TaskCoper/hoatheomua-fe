import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/features/auth/utils'

export const useGetUserHomePath = () => {
  const { me } = useGetMe()

  return getRoleHomePath(getUserType(me))
}
