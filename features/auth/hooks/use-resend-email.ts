'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import authService from '../services'

export const useResendEmail = () => {
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const email = searchParams.get('email')

  const { mutate: resendEmail, isPending: isResendingEmail } = useMutation({
    mutationFn: authService.resendEmail,

    onSuccess: (message) => {
      toast.success(message || 'Đã gửi lại email xác thực.')
    },

    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail,
        descriptionClassName: '!text-[#314746]'
      })
    }
  })

  const handleResendEmail = () => {
    if (!email) {
      toast(t('error.somethingWentWrong'), {
        description: 'Không tìm thấy token để gửi lại email xác thực.',
        descriptionClassName: '!text-[#314746]'
      })

      return
    }

    resendEmail({
      body: {
        email
      }
    })
  }

  return {
    email,
    handleResendEmail,
    isResendingEmail
  }
}
