import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userService from '../services'
import type { ChangePasswordPayload } from '../types'

export const useChangePassword = () => {
  const { t } = useTranslation()

  const { mutateAsync: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: (body: ChangePasswordPayload) => userService.changePassword(body),
    onSuccess: () => {
      toast.success(t('profile.passwordUpdated'))
    },
    onError: (error) => {
      // The form attaches this error to the current-password field.
      if (error.response?.data?.messageCode === 'OldPasswordNotMatched') return
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { resetPassword, isResettingPassword }
}
