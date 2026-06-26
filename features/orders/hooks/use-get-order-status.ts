import { useQuery } from '@tanstack/react-query'
import { getOrderStatusQuery } from '../queries'

export const useGetOrderStatus = ({ orderId, enabled }: { orderId: string; enabled: boolean }) => {
  const { data: orderStatus, isLoading: isLoadingOrderStatus } = useQuery({
    ...getOrderStatusQuery({ orderId }),
    refetchInterval: 5000,
    enabled
  })

  return { orderStatus, isLoadingOrderStatus }
}
