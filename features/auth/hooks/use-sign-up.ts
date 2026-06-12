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

const getTokenFromVerifyMessage = (message: string) => {
  const urlMatch = message.match(/https?:\/\/\S+/)

  if (!urlMatch) return null

  try {
    const url = new URL(urlMatch[0])
    return url.searchParams.get('token')
  } catch {
    return null
  }
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

      toast.success(t('auth.signUp.success'), {
        description: `${t('auth.signUp.emailDescription')} ${email}`
      })

      const params = new URLSearchParams()
      params.set('email', email)

      router.replace(`/verify-sent?${params.toString()}`)
    },

    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail,
        descriptionClassName: '!text-[#314746]'
      })
    }
  })

  return {
    methods,
    signUp,
    isSigningUp
  }
}
