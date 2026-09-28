import type { I18nKey } from '@/lib/i18n/types'
import type { CardWritingMethod, CheckoutCardType, GeneratedCardKind } from './types'

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

/** The kinds the account's card history lists - `GET v1/generated-cards` returns both. */
export const GENERATED_CARD_KIND_LABEL_KEYS: Record<GeneratedCardKind, I18nKey> = {
  ai: 'orders.cards.history.type.ai',
  handmade: 'orders.cards.history.type.handmade'
}
