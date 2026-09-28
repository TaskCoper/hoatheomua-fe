import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import userService from '../services'
import type { UpdateMePayload } from '../types'

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutateAsync: updateMe, isPending: isUpdatingMe } = useMutation({
    mutationFn: (body: UpdateMePayload) => userService.updateMe(body),
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return { updateMe, isUpdatingMe }
}
