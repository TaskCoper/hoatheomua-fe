import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { getPathname } from '@/lib/i18n/navigation'
import { writeSessionHint } from '@/shared/session-hint'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import userService from '../services'
import { resetPassWordFormValue, ResetPassWordFormValue } from '../validations'

export const useResetPassword = () => {
  const { t } = useTranslation()
  const locale = useLocale()
  const userHomePath = useGetUserHomePath()

  const methods = useForm<ResetPassWordFormValue>({
    defaultValues: {
      newPassword: ''
    },
    resolver: zodResolver(resetPassWordFormValue(t))
  })

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: (message) => {
      toast.success(message)

      writeSessionHint()
      window.location.assign(getPathname({ href: userHomePath, locale }))
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, resetPassword, isResettingPassword }
}
