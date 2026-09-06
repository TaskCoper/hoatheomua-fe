import type { I18nKey } from '@/lib/i18n/types'
import type { CardSizeId, CardWritingMethod, CheckoutCardType } from './types'

export const CARD_SIZE_LABEL_KEYS: Record<CardSizeId, I18nKey> = {
  s: 'orders.checkout.cards.sizes.s',
  m: 'orders.checkout.cards.sizes.m',
  l: 'orders.checkout.cards.sizes.l'
}

export const CARD_WRITING_METHOD_LABEL_KEYS: Record<CardWritingMethod, I18nKey> = {
  typed: 'orders.checkout.cards.writing.typed',
  handwritten: 'orders.checkout.cards.writing.handwritten'
}

export const CARD_TYPE_LABEL_KEYS: Record<CheckoutCardType, I18nKey> = {
  standard: 'orders.checkout.cards.tabs.standard',
  ai: 'orders.checkout.cards.tabs.ai',
  history: 'orders.checkout.cards.tabs.history'
}

export const CARD_TYPE_HINT_KEYS: Record<CheckoutCardType, I18nKey> = {
  standard: 'orders.checkout.cards.standardHint',
  ai: 'orders.checkout.cards.aiHint',
  history: 'orders.checkout.cards.historyHint'
}
