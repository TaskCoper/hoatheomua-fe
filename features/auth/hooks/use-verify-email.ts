import { useGetUserHomePath } from '@/hooks/use-get-user-home-path'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import authService from '../services'

export const useVerifyEmail = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const userHomePath = useGetUserHomePath()
  const searchParams = useSearchParams()

  const { t } = useTranslation()

  const token = searchParams.get('token')?.trim() || null

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: authService.verifyEmail,
    onMutate: (variables) => {
      if (!variables.body.token) {
        router.replace(userHomePath)
      }
    },
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })

      router.replace(userHomePath)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })

  return {
    token,
    verifyEmail,
    isVerifyingEmail
  }
}
