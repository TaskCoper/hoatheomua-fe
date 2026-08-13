import type { Me, UserProfile } from '@/features/users/types'
import type { Page } from '@playwright/test'
import { unwrap } from './unwrap'

const VI = { 'Accept-Language': 'vi' }

export const getProfileContact = async (page: Page): Promise<{ fullName: string; phone: string }> => {
  const me = await unwrap<Me>(page, '/api/taskcoper/v1/users/me', VI)
  const user = await unwrap<UserProfile>(page, `/api/taskcoper/v1/users/${me.slug}`, VI)

  return {
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    phone: user.phoneNumber ?? ''
  }
}
