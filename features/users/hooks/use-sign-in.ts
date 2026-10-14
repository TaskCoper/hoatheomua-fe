import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { writeSessionHint } from '@/shared/session-hint'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getAuthRedirectTarget, toBrowserPath } from '../auth-redirect'
import authService from '../services'
import { createSignInSchema, SignInFormValues } from '../validations'

const defaultValues: SignInFormValues = {
  phoneNumber: '',
  password: ''
}

export const useSignIn = () => {
  const locale = useLocale()
  const searchParams = useSearchParams()

  const { t } = useTranslation()
  const signInSchema = useMemo(() => createSignInSchema(t), [t])

  const methods = useForm<SignInFormValues>({
    defaultValues,
    resolver: zodResolver(signInSchema)
  })

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: authService.signIn,
    onSuccess: () => {
      writeSessionHint()

      window.location.assign(toBrowserPath(getAuthRedirectTarget(searchParams.get('from')), locale))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, signIn, isSigningIn }
}
