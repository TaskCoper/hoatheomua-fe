import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import authService from '../services'
import { createSignUpSchema, type SignUpFormValues } from '../validations'

const defaultValues: SignUpFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
}

export const useSignUp = () => {
  const router = useRouter()
  const { t } = useTranslation()

  const signUpSchema = useMemo(() => createSignUpSchema(t), [t])

  const methods = useForm<SignUpFormValues>({
    defaultValues,
    resolver: zodResolver(signUpSchema)
  })

  const { mutate: signUp, isPending: isSigningUp } = useMutation({
    mutationFn: authService.signUp,
    onSuccess: async (message, variables) => {
      const email = variables.body.email

      const params = new URLSearchParams()
      params.set('email', email)

      toast.success(message, {
        description: `${t('auth.signUp.emailDescription')} ${email}`
      })

      router.replace(`/verify-sent?${params.toString()}`)
    },

    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return {
    methods,
    signUp,
    isSigningUp
  }
}
