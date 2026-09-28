import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userService from '../services'

export const useChangePassword = () => {
  const { t } = useTranslation()

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: () => {
      toast.success(t('profile.passwordUpdated'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { resetPassword, isResettingPassword }
}
