import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { clearSessionMarker } from '@/lib/session-marker'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import authService from '../services'

export const useSignOut = () => {
  const queryClient = useQueryClient()

  const { t } = useTranslation()

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      clearSessionMarker()
      useCartStore.getState().clearCart()
      useCheckoutIntentStore.getState().clear()
      queryClient.clear()
      window.location.assign('/')
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { signOut, isSigningOut }
}
