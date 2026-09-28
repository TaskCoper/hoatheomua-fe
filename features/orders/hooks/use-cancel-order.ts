import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import orderService from '../services'

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: cancelOrder, isPending: isCancellingOrder } = useMutation({
    mutationFn: orderService.cancelOrder,
    onError: (error) => {
      toast.error(t('orders.list.detail.cancelError'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
      }
    }
  })

  return { cancelOrder, isCancellingOrder }
}
