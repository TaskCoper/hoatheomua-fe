import { useMutation } from '@tanstack/react-query'
import userService from '../services'
import type { ChangePasswordPayload } from '../types'

export const useChangePassword = () => {
  const {
    mutateAsync: changePassword,
    isPending: isChangingPassword,
  } = useMutation({
    mutationFn: (body: ChangePasswordPayload) => userService.changePassword(body),
  })

  return { changePassword, isChangingPassword }
}
