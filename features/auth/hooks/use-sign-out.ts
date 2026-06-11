import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import authService from '../services'

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { t } = useTranslation()

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      queryClient.clear()
      router.replace('/')
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { signOut, isSigningOut }
}
