import { useQueryClient, useMutation } from '@tanstack/react-query'
import userService from '../services'
import type { UpdateMePayload } from '../types'

export const useUpdateMe = () => {
  const queryClient = useQueryClient()

  const {
    mutateAsync: updateMe,
    isPending: isUpdatingMe,
  } = useMutation({
    mutationFn: (body: UpdateMePayload) => userService.updateMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return { updateMe, isUpdatingMe }
}
