import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import userService from '../services'
import { resetPassWordFormValue, ResetPassWordFormValue } from '../validations'

export const useResetPassword = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<ResetPassWordFormValue>({
    defaultValues: {
      newPassword: ''
    },
    resolver: zodResolver(resetPassWordFormValue(t))
  })

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, resetPassword, isResettingPassword }
}
