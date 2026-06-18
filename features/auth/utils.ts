import { Me } from './types'

export const ROLES = {
  Admin: 'Admin',
  User: 'User'
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const getUserType = (me: Me | null | undefined): Role | null => {
  if (!me) return null
  if (me.role.toLowerCase() === ROLES.Admin.toLowerCase()) return ROLES.Admin
  if (me.role.toLowerCase() === ROLES.User.toLowerCase()) return ROLES.User
  return null
}

export const getRoleHomePath = (role: Role | null): string => {
  if (role === ROLES.Admin) return '/dashboard'
  return '/'
}
