import { useMutation, useQueryClient } from '@tanstack/react-query'
import addressService from '../services'
import type { AddressPayload } from '../types'

export const useCreateAddress = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: createAddress,
    isPending: isCreatingAddress,
  } = useMutation({
    mutationFn: (body: AddressPayload) => addressService.createAddress(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  return { createAddress, isCreatingAddress }
}
