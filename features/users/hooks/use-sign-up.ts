import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { writeSessionHint } from '@/shared/session-hint'
import { useQueryClient } from '@tanstack/react-query'
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
  phoneNumber: '',
  password: '',
  confirmPassword: ''
}

export const useSignUp = () => {
  const router = useRouter()
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
      router.replace('/')
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
