import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import addressService from '../services'

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateAddress, isPending: isUpdatingAddress } = useMutation({
    mutationFn: addressService.updateAddress,
    onSuccess: () => {
      toast.success(t('profile.addressUpdated'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })

  return { updateAddress, isUpdatingAddress }
}
