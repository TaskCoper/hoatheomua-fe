import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import userService from '../services'
import { forgotPasswordFormValues, type ForgotPasswordFormValues } from '../validations'

export const useForgotPassword = () => {
  const { t } = useTranslation()
  const methods = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: ''
    },
    resolver: zodResolver(forgotPasswordFormValues(t))
  })

  const { mutate: forgotPassword, isPending: isForgotPasswordPending } = useMutation({
    mutationFn: userService.forgotPassword,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, forgotPassword, isForgotPasswordPending }
}
