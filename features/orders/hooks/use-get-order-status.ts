import { useQuery } from '@tanstack/react-query'
import { getOrderStatusQuery } from '../queries'

export const useGetOrderStatus = ({ orderId, enabled }: { orderId: string; enabled: boolean }) => {
  const { data: orderStatus, isLoading: isLoadingOrderStatus } = useQuery({
    ...getOrderStatusQuery({ orderId }),
    refetchInterval: 5000,
    // Don't outlive the screen that polls it: a disabled `useQuery` still hands
    // back cached data, so a leftover `Paid` would look like a fresh result on
    // the next mount.
    gcTime: 0,
    enabled
  })

  return { orderStatus, isLoadingOrderStatus }
}
