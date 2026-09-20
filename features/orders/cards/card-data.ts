import type { CardTemplate } from '@/types/card-template.type'
import type { GeneratedCardItem } from '@/types/generated-card.type'
import { OrderCardFormType } from '../types'
import { countWords, getCardUnitPrice, type CardConfig } from './card-config'
import type {
  CardContent,
  CardWritingMethod,
  CheckoutCard,
  CheckoutCardTemplate,
  GeneratedCard,
  GeneratedCardType
} from './types'

export const DEFAULT_CARD_WRITING_METHOD: CardWritingMethod = 'typed'

export const EMPTY_CARD_TEMPLATE: CheckoutCardTemplate = { templateId: '', templateName: '', templateImageUrl: '' }

export const toCheckoutCardTemplate = (template: CardTemplate): CheckoutCardTemplate => ({
  templateId: template.id,
  templateName: template.name,
  templateImageUrl: template.imageUrl
})

const WRITING_METHOD_BY_FORM_TYPE: Record<OrderCardFormType, CardWritingMethod> = {
  [OrderCardFormType.GoMay]: 'typed',
  [OrderCardFormType.Calligraphy]: 'handwritten'
}

const isOrderCardFormType = (value: number): value is OrderCardFormType => value in WRITING_METHOD_BY_FORM_TYPE

/** One row of the generated-card API, as the checkout draws it. */
export const toGeneratedCard = (item: GeneratedCardItem): GeneratedCard => ({
  id: item.id,
  templateId: item.cardTemplateId ?? '',
  templateName: item.cardTemplateName ?? '',
  sizeName: item.sizeName ?? '',
  writingMethod:
    typeof item.formType === 'number' && isOrderCardFormType(item.formType)
      ? WRITING_METHOD_BY_FORM_TYPE[item.formType]
      : DEFAULT_CARD_WRITING_METHOD,
  content: { message: item.messageContent ?? '' },
  imageUrl: item.imageUrl ?? '',
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

/**
 * A character backstop for the textarea only. What actually limits a message is the word
 * budget of its size (`CardSize.max_words`) - see `getCardMaxWords`.
 */
export const CARD_MESSAGE_MAX_LENGTH = 500

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
    // A free card leaves the product open to either design; only a designed one locks it.
    if (card.type !== 'standard') capacity.lockedType = card.type
  })

  return capacities
}

const getCheckoutCardUnitPrice = (card: CheckoutCard, config: CardConfig): number => {
  // Free: it ships with the flowers.
  if (card.type === 'standard') return 0

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

// TODO(backend): replace with the user's generated-cards endpoint. Set to `[]` to
// review the history tab's empty state.
export const MOCK_GENERATED_CARDS: GeneratedCard[] = [
  {
    id: 'generated-sample-1',
    templateId: 'floral',
    templateName: 'Floral',
    sizeName: 'M',
    writingMethod: 'handwritten',
    content: { message: 'Chúc mừng sinh nhật! Mong mọi điều dịu dàng nhất sẽ đến với cậu.' },
    imageUrl: '/images/custom/custom-flower.png',
    createdAt: '2026-09-03T09:15:00.000Z'
  },
  {
    id: 'generated-sample-2',
    templateId: 'golden',
    templateName: 'Golden Hour',
    sizeName: 'S',
    writingMethod: 'typed',
    content: { message: 'Cảm ơn vì đã luôn ở đây. Chúc một ngày thật nhiều nắng.' },
    imageUrl: '/images/5.webp',
    createdAt: '2026-08-28T02:40:00.000Z'
  },
  {
    id: 'generated-sample-3',
    templateId: 'garden',
    templateName: 'Garden',
    sizeName: 'L',
    writingMethod: 'handwritten',
    content: { message: 'Chúc hai bạn trăm năm hạnh phúc, luôn giữ được sự dịu dàng của hôm nay.' },
    imageUrl: '/images/ContactFlower.png',
    createdAt: '2026-08-21T11:05:00.000Z'
  }
]
