import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetOrder = ({ orderId, enabled = true }: { orderId: string; enabled?: boolean }) => {
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder({ orderId }),
    enabled: enabled && !!orderId
  })

  return { order, isLoadingOrder }
}
