import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetOrders = () => {
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders()
  })

  return { orders, isLoadingOrders }
}
