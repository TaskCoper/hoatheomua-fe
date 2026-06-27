import { useQuery } from '@tanstack/react-query'
import { getOrdersQuery } from '../queries'

export const useGetOrders = () => {
  const { data: orders, isLoading: isLoadingOrders } = useQuery(getOrdersQuery())

  return { orders, isLoadingOrders }
}
