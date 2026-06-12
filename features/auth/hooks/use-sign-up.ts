import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import authService from '../services'
import { createSignUpSchema, SignUpFormValues } from '../validations'

const defaultValues: SignUpFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
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

export const useSignUp = () => {
  const router = useRouter()
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
    onSuccess: async (message, variables) => {
      const email = variables.body.email
      toast.success(message, {
        description: `Vui lòng kiểm tra email ${email} để xác thực tài khoản.`
      })
      router.replace(`/verify?email=${encodeURIComponent(email)}`)
      // const me = await authService.getMe()
      // queryClient.setQueryData(['me'], me)

      // // if 'from' is missing or unsafe (open-redirect attempt, external URL, …), fall through to the role-based home
      // const from = searchParams.get('from')
      // const roleHome = getRoleHomePath(getUserType(me))
      // const target = isSafeInternalPath(from) ? from : roleHome
      // router.replace(target)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, signUp, isSigningUp }
}
