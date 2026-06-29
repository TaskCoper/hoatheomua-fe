import { useQuery } from '@tanstack/react-query'
import addressService from '../services'

export const useGetAddress = (id?: string, enabled = true) => {
  const { data: address, isPending, isFetching } = useQuery({
    queryKey: ['addresses', id],
    queryFn: () => addressService.getAddressById(id!),
    enabled: enabled && !!id,
    retry: false
  })

  return { address, isLoading: isPending || isFetching }
}
