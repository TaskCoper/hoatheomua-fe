import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname } from '@/lib/i18n/navigation'
import { isPublicRoutePath } from '@/shared/constants'
import { clearSessionHint } from '@/shared/session-hint'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { toBrowserPath } from '../auth-redirect'
import authService from '../services'

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const locale = useLocale()

  const { t } = useTranslation()

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      clearSessionHint()
      useCartStore.getState().clearCart()
      useCheckoutIntentStore.getState().clear()
      queryClient.clear()

      if (isPublicRoutePath(pathname)) {
        window.location.reload()
        return
      }

      window.location.assign(toBrowserPath('/', locale))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { signOut, isSigningOut }
}
