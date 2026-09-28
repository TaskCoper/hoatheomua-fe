export const CardTemplateType = {
  Ai: 'ai',
  Handmade: 'handmade'
} as const

export type CardTemplateType = (typeof CardTemplateType)[keyof typeof CardTemplateType]

export interface CardTemplate {
  id: string
  name: string
  description: string
  imageUrl: string
  templateType: CardTemplateType
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string | null
}
