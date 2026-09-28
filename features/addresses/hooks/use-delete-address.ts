import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import addressService from '../services'

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteAddress, isPending: isDeletingAddress } = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      toast.success(t('profile.addressDeleted'))
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

  return { deleteAddress, isDeletingAddress }
}
