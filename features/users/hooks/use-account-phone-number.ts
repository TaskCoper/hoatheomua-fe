import { useGetMe } from './use-get-me'
import { useGetUser } from './use-get-user'

export const useAccountPhoneNumber = () => {
  const { me, isGettingMe } = useGetMe()
  const { user, isLoading: isLoadingUser } = useGetUser(me?.slug)

  return {
    slug: me?.slug,
    hasPhoneNumber: !!user?.phoneNumber,
    isLoading: isGettingMe || isLoadingUser
  }
}
