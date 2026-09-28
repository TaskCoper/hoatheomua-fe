import { useGetMe } from './use-get-me'

export const useAccountPhoneNumber = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { me, isGettingMe } = useGetMe()
  return { slug: me?.slug, hasPhoneNumber: !!me?.phoneNumber, isLoading: enabled && isGettingMe }
}
