import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { setSessionMarker } from '@/lib/session-marker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const { t } = useTranslation()
  const signInSchema = useMemo(() => createSignInSchema(t), [t])

  const methods = useForm<SignInFormValues>({
    defaultValues,
    resolver: zodResolver(signInSchema)
  })

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: authService.signIn,
    onSuccess: async () => {
      setSessionMarker()
      const me = await authService.getMe()
      queryClient.setQueryData(['me'], me)

      const from = searchParams.get('from')
      const target = isSafeInternalPath(from) ? from : '/'
      router.replace(target)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })

  return { methods, signIn, isSigningIn }
}
