import { useMutation } from '@tanstack/react-query'
import userService from '../services'
import type { ChangePasswordPayload } from '../types'

export const useChangePassword = () => {
  const { mutateAsync: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: (body: ChangePasswordPayload) => userService.resetPassword({ body })
  })

  return { resetPassword, isResettingPassword }
}
