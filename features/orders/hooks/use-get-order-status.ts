import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetOrderStatus = ({ orderId, enabled }: { orderId: string; enabled: boolean }) => {
  const { data: orderStatus, isLoading: isLoadingOrderStatus } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: () => orderService.getOrderStatus({ orderId }),
    refetchInterval: 5000,
    enabled
  })

  return { orderStatus, isLoadingOrderStatus }
}
