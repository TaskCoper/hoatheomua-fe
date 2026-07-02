import { useMutation, useQueryClient } from '@tanstack/react-query'
import orderService from '../services'

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: createOrder,
    isPending: isCreatingOrder,
    data: createdOrder,
    reset: resetCreate
  } = useMutation({
    mutationFn: orderService.createOrder,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  return { createOrder, isCreatingOrder, createdOrder, resetCreate }
}
