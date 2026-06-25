export interface Me {
  avatar: string | null
  email: string
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
  email: string
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
