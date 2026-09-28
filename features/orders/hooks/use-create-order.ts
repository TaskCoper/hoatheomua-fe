import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import orderService from '../services'

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const {
    mutateAsync: createOrder,
    isPending: isCreatingOrder,
    data: createdOrder,
    reset: resetCreate
  } = useMutation({
    mutationFn: orderService.createOrder,
    onError: (error) => {
      toast.error(t('orders.checkout.createError'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  return { createOrder, isCreatingOrder, createdOrder, resetCreate }
}
