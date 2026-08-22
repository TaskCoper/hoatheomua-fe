import { useGetMe } from './use-get-me'
import { useGetUser } from './use-get-user'

export const useAccountPhoneNumber = () => {
  const { me, isGettingMe } = useGetMe()
  const { user, isLoading: isLoadingUser } = useGetUser(me?.slug)

  return {
    slug: me?.slug,
    hasPhoneNumber: !!user?.phoneNumber,
    /*
     * `isLoading` means "we do not yet know whether this account has a phone number", so a
     * caller can tell that apart from "it has none".
     *
     * The slug guard is load-bearing: `useGetUser` is `enabled: !!slug` and reports
     * `isPending || isFetching`, and a disabled query stays `pending` forever - the same trap
     * `useGetMe` documents. Without the guard an anonymous visitor would be reported as
     * loading indefinitely, and anything that waits on this would never become available to
     * them.
     */
    isLoading: isGettingMe || (!!me?.slug && isLoadingUser)
  }
}
