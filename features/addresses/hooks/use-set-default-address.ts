import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import addressService from '../services'

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: setDefaultAddress, isPending: isSettingDefaultAddress } = useMutation({
    mutationFn: addressService.setDefaultAddress,
    onSuccess: () => {
      toast.success(t('profile.addressDefaultSet'))
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

  return { setDefaultAddress, isSettingDefaultAddress }
}
