import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { createSignInSchema, SignInFormValues } from '../validations'

const defaultValues: SignInFormValues = {
  email: '',
  password: ''
}

export const useSignIn = () => {
  const { t } = useTranslation()
  const signInSchema = useMemo(() => createSignInSchema(t), [t])

  const methods = useForm<SignInFormValues>({
    defaultValues,
    resolver: zodResolver(signInSchema)
  })

  return { methods }
}
