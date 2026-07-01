import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import orderService from '../services'

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    mutateAsync: createOrder,
    isPending: isCreatingOrder,
    data: createdOrder,
    reset: resetCreate
  } = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      router.push('/orders')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  return { createOrder, isCreatingOrder, createdOrder, resetCreate }
}
