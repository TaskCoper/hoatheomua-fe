import type { CheckoutCardType, OrderAiCard } from './types'

export const ARE_CARDS_ENABLED: boolean = false

export const CARD_TYPE_CONSTANT_LABELS: Record<CheckoutCardType, string> = {
  standard: 'Thiệp thường',
  ai: 'Thiệp Custom AI',
  history: 'Thiệp đã tạo'
}

export const ORDER_CARD_CONSTANT_LABELS: Record<OrderAiCard['type'], string> = {
  ai: CARD_TYPE_CONSTANT_LABELS.ai,
  handmade: CARD_TYPE_CONSTANT_LABELS.standard
}
