'use client'

import { useGetInfiniteCardTemplates } from '@/hooks/use-get-card-templates'
import { CardTemplateType } from '@/types/card-template.type'
import type { CheckoutCardType } from '../cards/types'

/** One page of the picker grid. */
export const CARD_TEMPLATE_PAGE_SIZE = 12

/** Which template kind a card type is designed from; a reused card needs none. */
export const CARD_TEMPLATE_TYPE_BY_CARD_TYPE: Partial<Record<CheckoutCardType, CardTemplateType>> = {
  standard: CardTemplateType.Handmade,
  ai: CardTemplateType.Ai
}

/** Active templates of one kind, a page at a time. */
export const useCardTemplates = (templateType?: CardTemplateType, { enabled }: { enabled?: boolean } = {}) => {
  const {
    cardTemplates,
    totalCount,
    isGettingCardTemplates,
    isCardTemplatesError,
    isGettingMoreCardTemplates,
    hasMoreCardTemplates,
    loadMoreCardTemplates
  } = useGetInfiniteCardTemplates({ pageSize: CARD_TEMPLATE_PAGE_SIZE, templateType, enabled })

  return {
    templates: cardTemplates,
    totalCount,
    isGettingCardTemplates,
    isCardTemplatesError,
    isGettingMoreCardTemplates,
    hasMoreCardTemplates,
    loadMoreCardTemplates
  }
}
