'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import authService from '../services'

export const useVerify = () => {
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const token = searchParams.get('token')

  const {
    mutate: verifyEmail,
    isPending: isVerifyingEmail,
    isSuccess: isVerifySuccess
  } = useMutation({
    mutationFn: authService.verifyEmail,

    onSuccess: (message) => {
      toast.success(message || t('auth.verifyEmailPending.success'))
    },

    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail,
        descriptionClassName: '!text-[#314746]'
      })
    }
  })

  const handleVerifyEmail = () => {
    if (!token) {
      toast(t('error.somethingWentWrong'), {
        description: t('auth.verifyEmailPending.success'),
        descriptionClassName: '!text-[#314746]'
      })

      return
    }

    verifyEmail({
      body: {
        token
      }
    })
  }

  return {
    token,
    handleVerifyEmail,
    isVerifySuccess,
    isVerifyingEmail
  }
}
