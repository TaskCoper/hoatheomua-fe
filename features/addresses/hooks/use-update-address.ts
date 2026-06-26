import { useMutation, useQueryClient } from '@tanstack/react-query'
import addressService from '../services'
import type { AddressPayload } from '../types'

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: updateAddress,
    isPending: isUpdatingAddress,
  } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressPayload }) =>
      addressService.updateAddress({ id, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  return { updateAddress, isUpdatingAddress }
}
