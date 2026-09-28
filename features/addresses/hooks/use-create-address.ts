import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import addressService from '../services'

export const useCreateAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: createAddress, isPending: isCreatingAddress } = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: () => {
      toast.success(t('profile.addressCreated'))
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

  return { createAddress, isCreatingAddress }
}
