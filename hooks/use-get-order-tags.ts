import configService from '@/services/config.service'
import { useQuery } from '@tanstack/react-query'

export const useGetOrderTags = () => {
  const { data: orderTags, isLoading: isGettingOrderTags } = useQuery({
    queryKey: ['configs', 'order-tags'],
    queryFn: configService.getOrderTags
  })

  return { orderTags, isGettingOrderTags }
}
