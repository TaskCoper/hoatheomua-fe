import type { CardTemplate } from '@/types/card-template.type'
import type { GeneratedCardByProductItem, GeneratedCardHistoryItem } from '@/types/generated-card.type'
import { OrderSnapshotCardType, OrderSnapshotFormType } from '../types'
import { countWords, getCardHandwritingPrice, getCardUnitPrice, type CardConfig } from './card-config'
import type {
  CardContent,
  CardWritingMethod,
  CheckoutCard,
  CheckoutCardTemplate,
  GeneratedCard,
  GeneratedCardHistoryEntry,
  GeneratedCardType
} from './types'

export const DEFAULT_CARD_WRITING_METHOD: CardWritingMethod = 'typed'

export const EMPTY_CARD_TEMPLATE: CheckoutCardTemplate = { templateId: '', templateName: '', templateImageUrl: '' }

export const toCheckoutCardTemplate = (template: CardTemplate): CheckoutCardTemplate => ({
  templateId: template.id,
  templateName: template.name,
  templateImageUrl: template.imageUrl
})

/** One row of `POST v1/generated-cards/by-products`, as the checkout's reuse gallery draws it. */
export const toGeneratedCard = (item: GeneratedCardByProductItem): GeneratedCard => ({
  id: item.id,
  templateId: '',
  templateName: '',
  sizeName: item.sizeName,
  writingMethod: item.formType === OrderSnapshotFormType.Calligraphy ? 'handwritten' : DEFAULT_CARD_WRITING_METHOD,
  content: { message: item.messageContent },
  imageUrl: item.imageUrl,
  createdAt: item.createdAt
})

/** Centimetres the card prints at; anything the API leaves at zero is nothing to print. */
const toPrintedSize = (value: number): number | null => (value > 0 ? value : null)

/**
 * One row of the account's card history. `GET v1/generated-cards` spells `formType` and
 * `cardType` as strings, not as the numbers the create payload sends.
 */
export const toGeneratedCardHistoryEntry = (item: GeneratedCardHistoryItem): GeneratedCardHistoryEntry => ({
  id: item.id,
  kind: item.cardType === OrderSnapshotCardType.Handmade ? 'handmade' : 'ai',
  sizeName: item.sizeName ?? '',
  sizeWidth: toPrintedSize(item.sizeWidth ?? 0),
  sizeHeight: toPrintedSize(item.sizeHeight ?? 0),
  writingMethod: item.formType === OrderSnapshotFormType.Calligraphy ? 'handwritten' : DEFAULT_CARD_WRITING_METHOD,
  content: { message: item.messageContent ?? '' },
  imageUrl: item.imageUrl ?? '',
  rawImageUrl: item.rawImage ?? '',
  attachedImageUrl: item.attachedImageUrl ?? '',
  totalPrice: item.totalPrice ?? 0,
  createdAt: item.createdAt ?? ''
})

/** Snapshot of the generation a reused card is printed from - see `HistoryCheckoutCard`. */
export const readGeneratedCardSnapshot = (
  card: GeneratedCard | null
): Pick<GeneratedCard, 'templateName' | 'imageUrl' | 'sizeName'> => ({
  templateName: card?.templateName ?? '',
  imageUrl: card?.imageUrl ?? '',
  sizeName: card?.sizeName ?? ''
})

export const readCheckoutCardTemplate = ({
  templateId,
  templateName,
  templateImageUrl
}: CheckoutCardTemplate): CheckoutCardTemplate => ({ templateId, templateName, templateImageUrl })

export const CARD_MAX_QUANTITY = 20
export const DEFAULT_CARD_QUANTITY = 1

export const EMPTY_CARD_CONTENT: CardContent = { message: '' }

export const trimCardContent = (content: CardContent): CardContent => ({ message: content.message.trim() })

export const isSameCardContent = (a: CardContent, b: CardContent): boolean => a.message === b.message

export interface LineCardCapacity {
  /** Units on the line that do not carry a card yet. */
  remaining: number
  /** The designed kind already on the line - a line never mixes AI with history cards. */
  lockedType: GeneratedCardType | null
}

/**
 * What each line can still take. A line holds one card per unit, so a product bought three
 * times can carry three separate cards - free ones included, since a unit that already ships
 * with a card cannot carry a second. The first designed card decides the kind for the rest.
 * `ignoreIndex` leaves the card being edited out so it does not block its own line.
 */
export const getLineCardCapacities = (
  lines: { lineId: string; quantity: number }[],
  cards: CheckoutCard[],
  ignoreIndex: number | null = null
): Map<string, LineCardCapacity> => {
  const capacities = new Map<string, LineCardCapacity>(
    lines.map((line) => [line.lineId, { remaining: line.quantity, lockedType: null }])
  )

  cards.forEach((card, index) => {
    if (index === ignoreIndex) return

    const capacity = capacities.get(card.lineId)
    if (!capacity) return

    capacity.remaining -= card.quantity
    // A standard card leaves the product open to either design; only a designed one locks it.
    if (card.type !== 'standard') capacity.lockedType = card.type
  })

  return capacities
}

const getCheckoutCardUnitPrice = (card: CheckoutCard, config: CardConfig): number => {
  // The standard card is the handmade one our florist writes: it is ordered without a size and
  // is calligraphy by definition, so the handwriting ladder is the whole of its price.
  if (card.type === 'standard') return getCardHandwritingPrice(config, countWords(card.content.message))

  return getCardUnitPrice({
    config,
    sizeName: card.sizeName,
    wordCount: countWords(card.content.message),
    writingMethod: card.writingMethod
  })
}

export const getCheckoutCardPrice = (card: CheckoutCard, config: CardConfig): number =>
  getCheckoutCardUnitPrice(card, config) * card.quantity

export const getCardsTotal = (cards: CheckoutCard[], config: CardConfig): number =>
  cards.reduce((total, card) => total + getCheckoutCardPrice(card, config), 0)
