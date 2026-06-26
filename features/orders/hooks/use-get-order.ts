import { useQuery } from '@tanstack/react-query'
import { getOrderQuery } from '../queries'

export const useGetOrder = ({ orderId, enabled = true }: { orderId: string; enabled?: boolean }) => {
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    ...getOrderQuery({ orderId }),
    enabled: enabled && !!orderId
  })

  return { order, isLoadingOrder }
}
