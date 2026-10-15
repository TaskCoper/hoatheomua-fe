import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { writeSessionHint } from '@/shared/session-hint'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { getAuthRedirectTarget, toBrowserPath } from '../auth-redirect'
import authService from '../services'
import { phoneOtpError } from '../otp-error'

export const useSignIn = () => {
  const locale = useLocale()
  const searchParams = useSearchParams()

  const { t } = useTranslation()
  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: authService.signIn,
    retry: false,
    onSuccess: () => {
      writeSessionHint()

      window.location.assign(toBrowserPath(getAuthRedirectTarget(searchParams.get('from')), locale))
    },
    onError: (error) => {
      toast.error(phoneOtpError(error, t))
    }
  })

  return { signIn, isSigningIn }
}
