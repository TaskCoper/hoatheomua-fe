'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authService from '../services'

export const useResendCode = () => {
  const { t } = useTranslation()

  const { mutate: resendCode, isPending: isResendingCode } = useMutation({
    mutationFn: authService.resendCode,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return {
    resendCode,
    isResendingCode
  }
}
