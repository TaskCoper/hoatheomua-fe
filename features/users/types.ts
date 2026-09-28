export const Role = {
  Customer: 'Customer'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export interface Me {
  registrationMethod?: 'Email' | 'Phone'
  canUseStorefront?: boolean
  canChangePhoneNumber?: boolean
  phoneNumber?: string | null
  avatar: string | null
  email: string | null
  firstName: string
  id: string
  isEmailVerified: boolean
  lastName: string
  organizationId: string | null
  role: string
  slug: string
}

export interface UserProfile {
  id: string
  slug: string
  email: string | null
  firstName: string
  lastName: string
  isEmailVerified: boolean
  phoneNumber: string | null
  timeZone: string
  avatar: string | null
  coverImageUrl: string | null
  role: string
  address: string | null
  city: string | null
  state: string | null
  organizationId: string | null
  createdOnUtc: string
}

export interface UpdateMePayload {
  firstName: string
  lastName: string
  email: string
  avatar: string
  coverImageUrl: string
  phoneNumber: string
  address: string
  city: string
  state: string
  timeZone: string
  domainIds: string[]
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
