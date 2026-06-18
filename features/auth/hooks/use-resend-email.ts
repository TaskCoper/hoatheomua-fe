'use client'

import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { createEmailSchema } from '@/shared/validations'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import authService from '../services'

export const useResendEmail = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userHomePath = useGetUserHomePath()

  const { t } = useTranslation()

  const email = searchParams.get('email')?.trim() || null

  const { mutate: resendEmail, isPending: isResendingEmail } = useMutation({
    mutationFn: authService.resendEmail,
    onMutate: (variables) => {
      const validated = createEmailSchema(t).safeParse(variables.body.email)

      if (!validated.success) {
        router.replace(userHomePath)
      }
    },
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  const handleResendEmail = () => {
    if (!email) {
      toast.error(t('error.somethingWentWrong'), {
        description: 'Không tìm thấy token để gửi lại email xác thực.'
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
