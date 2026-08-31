import { useQuery } from '@tanstack/react-query'
import { getLatLngQuery } from '../queries'

export const useGetLatLng = ({ address, enabled }: { address?: string; enabled?: boolean }) => {
  const { data: latLng, isLoading: isLoadingLatLng } = useQuery({
    ...getLatLngQuery({ address }),
    enabled: enabled && !!address
  })

  return { latLng, isLoadingLatLng }
}
