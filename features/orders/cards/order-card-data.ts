import type { OrderItem } from '../types'
import { countWords, getCardUnitPrice, type CardConfig } from './card-config'
import type { CardContent, CardWritingMethod, OrderAiCard, OrderCardVersion } from './types'

/**
 * TODO(backend): the generator will return the artwork it painted. Until then a new version
 * cycles this pool so consecutive generations at least look different from each other.
 */
const MOCK_ARTWORK_POOL = [
  '/images/custom/custom-flower.png',
  '/images/5.webp',
  '/images/ContactFlower.png',
  '/images/2.webp',
  '/images/8.webp',
  '/images/6.webp'
]

export const getOrderCardArtwork = (versionIndex: number): string =>
  MOCK_ARTWORK_POOL[versionIndex % MOCK_ARTWORK_POOL.length]

export const findOrderCardVersion = (card: OrderAiCard, versionId: string): OrderCardVersion | null =>
  card.versions.find((version) => version.id === versionId) ?? null

/** The version that goes to print - falls back to the newest one if the selection is stale. */
export const getSelectedOrderCardVersion = (card: OrderAiCard): OrderCardVersion | null =>
  findOrderCardVersion(card, card.selectedVersionId) ?? card.versions.at(-1) ?? null

export const getOrderCardUnitPrice = ({
  card,
  content,
  writingMethod,
  config
}: {
  card: OrderAiCard
  content: CardContent
  writingMethod: CardWritingMethod
  config: CardConfig
}): number =>
  getCardUnitPrice({
    config,
    sizeName: card.sizeName,
    wordCount: countWords(content.message),
    writingMethod
  })

/**
 * What the card would cost now versus what was already paid. Positive means the customer
 * owes the difference; we only show it, the order total is settled separately.
 */
export const getOrderCardPriceDelta = ({
  card,
  content,
  writingMethod,
  config
}: {
  card: OrderAiCard
  content: CardContent
  writingMethod: CardWritingMethod
  config: CardConfig
}): number => (getOrderCardUnitPrice({ card, content, writingMethod, config }) - card.paidUnitPrice) * card.quantity

export interface OrderItemCards {
  orderDetailsId: string
  productName: string
  /** Units of this item bought, and how many of them a card is printed for. */
  quantity: number
  carded: number
  cards: OrderAiCard[]
}

/** The cards of an order laid out under the item each one is printed for. */
export const groupOrderAiCards = (items: OrderItem[], cards: OrderAiCard[]): OrderItemCards[] =>
  items
    .map((item) => {
      const itemCards = cards.filter((card) => card.orderDetailsId === item.orderDetailsId)

      return {
        orderDetailsId: item.orderDetailsId,
        productName: item.name,
        quantity: item.number,
        carded: itemCards.reduce((total, card) => total + card.quantity, 0),
        cards: itemCards
      }
    })
    .filter((group) => group.cards.length > 0)

/** Seeds per item, so an item bought more than once shows more than one card. */
const MOCK_ITEM_SEEDS = [
  [
    {
      templateId: 'floral',
      templateName: 'Floral',
      templateImageUrl: '/images/custom/custom-flower.png',
      sizeName: 'M',
      writingMethod: 'handwritten',
      quantity: 1,
      versions: [
        {
          message: 'Chúc mừng sinh nhật! Mong mọi điều dịu dàng nhất sẽ đến với cậu.',
          createdAt: '2026-09-04T02:15:00.000Z'
        },
        {
          message: 'Chúc mừng sinh nhật cậu nhé! Một tuổi mới thật nhiều nắng và thật nhiều hoa.',
          createdAt: '2026-09-04T02:24:00.000Z'
        }
      ]
    },
    {
      templateId: 'blush',
      templateName: 'Blush',
      templateImageUrl: '/images/2.webp',
      sizeName: 'S',
      writingMethod: 'typed',
      quantity: 1,
      versions: [
        {
          message: 'Gửi cậu một mùa hoa nữa, và thật nhiều điều dịu dàng phía trước.',
          createdAt: '2026-09-04T02:31:00.000Z'
        }
      ]
    }
  ],
  [
    {
      templateId: 'golden',
      templateName: 'Golden Hour',
      templateImageUrl: '/images/5.webp',
      sizeName: 'S',
      writingMethod: 'typed',
      quantity: 2,
      versions: [
        {
          message: 'Cảm ơn chị vì đã luôn ở đây. Chúc chị một ngày thật nhiều nắng.',
          createdAt: '2026-09-04T03:05:00.000Z'
        }
      ]
    }
  ]
] as const

/**
 * TODO(backend): replace with the order's card list. The demo cards the first lines of the
 * order so the section always has something to show, never printing more cards than the
 * item has units.
 */
export const buildMockOrderAiCards = (items: OrderItem[], config: CardConfig): OrderAiCard[] =>
  items.slice(0, MOCK_ITEM_SEEDS.length).flatMap((item, itemIndex) => {
    let unitsLeft = Math.max(0, item.number)

    return MOCK_ITEM_SEEDS[itemIndex].flatMap((seed, cardIndex): OrderAiCard[] => {
      const quantity = Math.min(seed.quantity, unitsLeft)
      if (quantity < 1) return []
      unitsLeft -= quantity

      const versions: OrderCardVersion[] = seed.versions.map((version, versionIndex) => ({
        id: `${item.orderDetailsId}-card-${cardIndex + 1}-version-${versionIndex + 1}`,
        label: versionIndex + 1,
        imageUrl: getOrderCardArtwork(itemIndex + cardIndex + versionIndex),
        content: { message: version.message },
        createdAt: version.createdAt
      }))

      const selected = versions[versions.length - 1]

      return [
        {
          id: `${item.orderDetailsId}-card-${cardIndex + 1}`,
          orderDetailsId: item.orderDetailsId,
          productName: item.name,
          productImageUrl: item.coverImage,
          templateId: seed.templateId,
          templateName: seed.templateName,
          templateImageUrl: seed.templateImageUrl,
          sizeName: seed.sizeName,
          quantity,
          paidUnitPrice: getCardUnitPrice({
            config,
            sizeName: seed.sizeName,
            wordCount: countWords(selected.content.message),
            writingMethod: seed.writingMethod
          }),
          writingMethod: seed.writingMethod,
          selectedVersionId: selected.id,
          versions
        }
      ]
    })
  })
