/**
 * Card template kinds, as the card-template API spells them. The order payload carries the same
 * two as numbers - see `OrderCardType` in `features/orders/types.ts`.
 */
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
