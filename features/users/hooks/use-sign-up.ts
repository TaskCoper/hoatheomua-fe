import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { writeSessionHint } from '@/shared/session-hint'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getAuthRedirectTarget, toBrowserPath } from '../auth-redirect'
import authService from '../services'
import { phoneOtpError } from '../otp-error'
import { createSignUpSchema, type SignUpFormValues } from '../validations'

const defaultValues: SignUpFormValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
}

export const useSignUp = () => {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const signUpSchema = useMemo(() => createSignUpSchema(t), [t])

  const methods = useForm<SignUpFormValues>({
    defaultValues,
    resolver: zodResolver(signUpSchema)
  })

  const { mutate: signUp, isPending: isSigningUp } = useMutation({
    mutationFn: authService.signUp,
    onSuccess: () => {
      writeSessionHint()
      queryClient.invalidateQueries({ queryKey: ['me'] })
      window.location.assign(toBrowserPath(getAuthRedirectTarget(searchParams.get('from')), locale))
    },
    onError: (error) => {
      toast.error(phoneOtpError(error, t))
    }
  })

  return {
    methods,
    signUp,
    isSigningUp
  }
}
