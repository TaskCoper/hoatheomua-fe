import { Me } from '../features/users/types'

export const ROLES = {
  Customer: 'Customer'
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const getUserType = (me: Me | null | undefined): Role | null => {
  if (!me) return null
  return ROLES.Customer
}

export const getRoleHomePath = (_userType: Role | null): string => {
  return '/'
}
