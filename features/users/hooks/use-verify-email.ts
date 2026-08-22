import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { clearSessionHint, writeSessionHint } from '@/shared/session-hint'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import authService from '../services'
import { createVerifyEmailSchema, type VerifyEmailFormValues } from '../validations'

interface UseVerifyEmailProps {
  email: string
}

export const useVerifyEmail = ({ email }: UseVerifyEmailProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const verifyEmailSchema = useMemo(() => createVerifyEmailSchema(t), [t])

  const verifyEmailMethods = useForm<VerifyEmailFormValues>({
    defaultValues: {
      email,
      code: ''
    },
    resolver: zodResolver(verifyEmailSchema)
  })

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: async () => {
      writeSessionHint()

      try {
        const me = await authService.getMe()
        queryClient.setQueryData(['me'], me)
      } catch {
        clearSessionHint()
        queryClient.removeQueries({ queryKey: ['me'] })
      }

      verifyEmailMethods.reset({ email, code: '' })
      router.replace('/')
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return {
    verifyEmailMethods,
    verifyEmail,
    isVerifyingEmail
  }
}
