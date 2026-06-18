import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export const useGetLatLng = ({ address, enabled }: { address?: string; enabled?: boolean }) => {
  const { data: latLng, isLoading: isLoadingLatLng } = useQuery({
    queryKey: ['lat-lng', address],
    queryFn: () => orderService.getLatLngFromAddress({ address }),
    enabled: enabled && !!address
  })

  return { latLng, isLoadingLatLng }
}
