import { useMutation, useQueryClient } from '@tanstack/react-query'
import orderService from '../services'

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  const { mutate: cancelOrder, isPending: isCancellingOrder } = useMutation({
    mutationFn: orderService.cancelOrder,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
      }
    }
  })

  return { cancelOrder, isCancellingOrder }
}
