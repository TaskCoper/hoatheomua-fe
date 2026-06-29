import { useMutation, useQueryClient } from '@tanstack/react-query'
import addressService from '../services'

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: deleteAddress,
    isPending: isDeletingAddress,
  } = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  return { deleteAddress, isDeletingAddress }
}
