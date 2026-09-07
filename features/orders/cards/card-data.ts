import type {
  CardContent,
  CardSizeId,
  CardSizeOption,
  CardTemplate,
  CardWritingMethod,
  CheckoutCard,
  GeneratedCard
} from './types'

export const CARD_TEMPLATES: CardTemplate[] = [
  { id: 'floral', name: 'Floral', imageUrl: '/images/custom/custom-flower.png' },
  { id: 'blush', name: 'Blush', imageUrl: '/images/2.webp' },
  { id: 'garden', name: 'Garden', imageUrl: '/images/ContactFlower.png' },
  { id: 'golden', name: 'Golden Hour', imageUrl: '/images/5.webp' },
  { id: 'linen', name: 'Linen', imageUrl: '/images/8.webp' },
  { id: 'classic', name: 'Classic', imageUrl: '/images/6.webp' }
]

export const CARD_SIZE_OPTIONS: CardSizeOption[] = [
  { id: 's', price: 15_000 },
  { id: 'm', price: 25_000 },
  { id: 'l', price: 40_000 }
]

export const DEFAULT_CARD_TEMPLATE_ID = CARD_TEMPLATES[0]?.id ?? ''
export const DEFAULT_CARD_SIZE_ID: CardSizeId = 'm'
export const DEFAULT_CARD_WRITING_METHOD: CardWritingMethod = 'typed'

export const CARD_MESSAGE_MAX_LENGTH = 200
export const CARD_NAME_MAX_LENGTH = 60
/** Characters included in the base price; beyond this it is priced in blocks. */
export const CARD_MESSAGE_INCLUDED_LENGTH = 80
export const CARD_MESSAGE_BLOCK_LENGTH = 40
export const CARD_MESSAGE_BLOCK_PRICE = 10_000
export const CARD_HANDWRITING_PRICE = 20_000

export const CARD_MAX_QUANTITY = 20
export const DEFAULT_CARD_QUANTITY = 1

export const EMPTY_CARD_CONTENT: CardContent = { receiver: '', sender: '', message: '' }

export const trimCardContent = (content: CardContent): CardContent => ({
  receiver: content.receiver.trim(),
  sender: content.sender.trim(),
  message: content.message.trim()
})

export const isSameCardContent = (a: CardContent, b: CardContent): boolean =>
  a.receiver === b.receiver && a.sender === b.sender && a.message === b.message

export const findCardTemplate = (templateId: string): CardTemplate | null =>
  CARD_TEMPLATES.find((template) => template.id === templateId) ?? null

export const getCardSizePrice = (sizeId: CardSizeId): number =>
  CARD_SIZE_OPTIONS.find((size) => size.id === sizeId)?.price ?? 0

export const getCardMessageSurcharge = (messageLength: number): number => {
  const extra = messageLength - CARD_MESSAGE_INCLUDED_LENGTH
  if (extra <= 0) return 0
  return Math.ceil(extra / CARD_MESSAGE_BLOCK_LENGTH) * CARD_MESSAGE_BLOCK_PRICE
}

export const getCardUnitPrice = ({
  sizeId,
  messageLength,
  writingMethod = 'typed'
}: {
  sizeId: CardSizeId
  messageLength: number
  writingMethod?: CardWritingMethod
}): number =>
  getCardSizePrice(sizeId) +
  getCardMessageSurcharge(messageLength) +
  (writingMethod === 'handwritten' ? CARD_HANDWRITING_PRICE : 0)

const getCheckoutCardUnitPrice = (card: CheckoutCard, generatedCards: GeneratedCard[]): number => {
  if (card.type === 'standard') {
    return getCardUnitPrice({ sizeId: card.sizeId, messageLength: card.content.message.length })
  }

  if (card.type === 'ai') {
    return getCardUnitPrice({
      sizeId: card.sizeId,
      messageLength: card.content.message.length,
      writingMethod: card.writingMethod
    })
  }

  const source = generatedCards.find((generated) => generated.id === card.generatedCardId)
  if (!source) return 0

  // Words and writing style belong to this order; only the size comes from the generation.
  return getCardUnitPrice({
    sizeId: source.sizeId,
    messageLength: card.content.message.length,
    writingMethod: card.writingMethod
  })
}

export const getCheckoutCardPrice = (card: CheckoutCard, generatedCards: GeneratedCard[]): number =>
  getCheckoutCardUnitPrice(card, generatedCards) * card.quantity

export const getCardsTotal = (cards: CheckoutCard[], generatedCards: GeneratedCard[]): number =>
  cards.reduce((total, card) => total + getCheckoutCardPrice(card, generatedCards), 0)

// TODO(backend): replace with the user's generated-cards endpoint. Set to `[]` to
// review the history tab's empty state.
export const MOCK_GENERATED_CARDS: GeneratedCard[] = [
  {
    id: 'generated-sample-1',
    templateId: 'floral',
    sizeId: 'm',
    writingMethod: 'handwritten',
    content: {
      receiver: 'Minh Anh',
      sender: 'Hà Vy',
      message: 'Chúc mừng sinh nhật! Mong mọi điều dịu dàng nhất sẽ đến với cậu.'
    },
    imageUrl: '/images/custom/custom-flower.png',
    createdAt: '2026-09-03T09:15:00.000Z'
  },
  {
    id: 'generated-sample-2',
    templateId: 'golden',
    sizeId: 's',
    writingMethod: 'typed',
    content: {
      receiver: 'Chị Lan',
      sender: 'Nhóm Marketing',
      message: 'Cảm ơn vì đã luôn ở đây. Chúc một ngày thật nhiều nắng.'
    },
    imageUrl: '/images/5.webp',
    createdAt: '2026-08-28T02:40:00.000Z'
  },
  {
    id: 'generated-sample-3',
    templateId: 'garden',
    sizeId: 'l',
    writingMethod: 'handwritten',
    content: {
      receiver: 'Thu Trang & Quốc Huy',
      sender: 'Gia đình Hoa Theo Mùa',
      message: 'Chúc hai bạn trăm năm hạnh phúc, luôn giữ được sự dịu dàng của hôm nay.'
    },
    imageUrl: '/images/ContactFlower.png',
    createdAt: '2026-08-21T11:05:00.000Z'
  }
]
