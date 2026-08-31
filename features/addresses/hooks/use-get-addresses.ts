import { useQuery } from '@tanstack/react-query'
import addressService from '../services'

interface UseGetAddressesOptions {
  enabled?: boolean
}

export const useGetAddresses = ({ enabled = true }: UseGetAddressesOptions = {}) => {
  const {
    data: addresses = [],
    isPending,
    isFetching
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled,
    retry: false
  })

  return { addresses, isLoading: isPending || isFetching }
}
