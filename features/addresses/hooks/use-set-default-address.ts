import { useMutation, useQueryClient } from '@tanstack/react-query'
import addressService from '../services'

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: setDefaultAddress,
    isPending: isSettingDefaultAddress,
  } = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  return { setDefaultAddress, isSettingDefaultAddress }
}
