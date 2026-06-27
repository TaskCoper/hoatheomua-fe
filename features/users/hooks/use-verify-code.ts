import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { toast } from 'sonner'
import userService from '../services'
import { verifyCodeSchema, type VerifyCodeFormValues } from '../validations'

export const useVerifyCode = () => {
  const { t } = useTranslation()

  const methods = useForm<VerifyCodeFormValues>({
    defaultValues: {
      email: '',
      code: ''
    },
    resolver: zodResolver(verifyCodeSchema(t))
  })

  const { mutate: verifyCode, isPending: isVerifyingCode } = useMutation({
    mutationFn: userService.verifyForgotPasswordCode,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, verifyCode, isVerifyingCode }
}
