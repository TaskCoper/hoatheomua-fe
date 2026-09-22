import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { routing } from '@/lib/i18n/routing'
import { writeSessionHint } from '@/shared/session-hint'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import authService from '../services'
import { createSignInSchema, SignInFormValues } from '../validations'

const defaultValues: SignInFormValues = {
  email: '',
  password: ''
}

const toBrowserPath = (path: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return path
  }

  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
    return path
  }

  return `/${locale}${path}`
}

const isSafeInternalPath = (path: string | null): path is string => {
  if (typeof window === 'undefined') return false
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false
  try {
    return new URL(path, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
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

      const from = searchParams.get('from')
      const target = isSafeInternalPath(from) ? from : '/'

      window.location.assign(toBrowserPath(target, locale))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, signIn, isSigningIn }
}
