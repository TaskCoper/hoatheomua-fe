import { useGetMe } from './use-get-me'
import { useGetUser } from './use-get-user'

export const useAccountPhoneNumber = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { me, isGettingMe } = useGetMe()
  const { user, isLoading: isLoadingUser } = useGetUser(me?.slug, { enabled })

  return {
    slug: me?.slug,
    hasPhoneNumber: !!user?.phoneNumber,
    isLoading: isGettingMe || isLoadingUser
  }
}
