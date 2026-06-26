import { I18nKey } from '@/lib/i18n/types'

export interface Article {
  id: string
  title: string
  description: string
  viewCount: number
  pictureUrl: string
  slug: string
  status: NewStatus
  user: {
    userId: string
    email: string
    userAvatar: string | null
    userFullName: string
  }
  categories: Array<{
    categoryId: string
    categoryName: string
  }>
  createdAt: string
  updatedAt: string | null
}

export const NewStatus = {
  Draft: 'Draft',
  Published: 'Published'
} as const

export type NewStatus = (typeof NewStatus)[keyof typeof NewStatus]

export const NewStatusLabel: Record<NewStatus, I18nKey> = {
  [NewStatus.Draft]: 'admin.news.status.draft',
  [NewStatus.Published]: 'admin.news.status.published'
}

export type NewStatusLabel = (typeof NewStatusLabel)[NewStatus]
