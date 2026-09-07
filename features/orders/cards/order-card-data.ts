import type { OrderItem } from '../types'
import { getCardUnitPrice } from './card-data'
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
  writingMethod
}: {
  card: OrderAiCard
  content: CardContent
  writingMethod: CardWritingMethod
}): number =>
  getCardUnitPrice({
    sizeId: card.sizeId,
    messageLength: content.message.trim().length,
    writingMethod
  })

/**
 * What the card would cost now versus what was already paid. Positive means the customer
 * owes the difference; we only show it, the order total is settled separately.
 */
export const getOrderCardPriceDelta = ({
  card,
  content,
  writingMethod
}: {
  card: OrderAiCard
  content: CardContent
  writingMethod: CardWritingMethod
}): number => (getOrderCardUnitPrice({ card, content, writingMethod }) - card.paidUnitPrice) * card.quantity

const MOCK_CARD_SEEDS = [
  {
    templateId: 'floral',
    sizeId: 'm',
    writingMethod: 'handwritten',
    quantity: 1,
    versions: [
      {
        receiver: 'Minh Anh',
        sender: 'Hà Vy',
        message: 'Chúc mừng sinh nhật! Mong mọi điều dịu dàng nhất sẽ đến với cậu.',
        createdAt: '2026-09-04T02:15:00.000Z'
      },
      {
        receiver: 'Minh Anh',
        sender: 'Hà Vy',
        message: 'Chúc mừng sinh nhật cậu nhé! Một tuổi mới thật nhiều nắng và thật nhiều hoa.',
        createdAt: '2026-09-04T02:24:00.000Z'
      }
    ]
  },
  {
    templateId: 'golden',
    sizeId: 's',
    writingMethod: 'typed',
    quantity: 2,
    versions: [
      {
        receiver: 'Chị Lan',
        sender: 'Nhóm Marketing',
        message: 'Cảm ơn chị vì đã luôn ở đây. Chúc chị một ngày thật nhiều nắng.',
        createdAt: '2026-09-04T03:05:00.000Z'
      }
    ]
  }
] as const

/**
 * TODO(backend): replace with the order's card list. The demo attaches a card to the first
 * lines of the order so the section always has something to show.
 */
export const buildMockOrderAiCards = (items: OrderItem[]): OrderAiCard[] =>
  items.slice(0, MOCK_CARD_SEEDS.length).map((item, cardIndex) => {
    const seed = MOCK_CARD_SEEDS[cardIndex]

    const versions: OrderCardVersion[] = seed.versions.map((version, versionIndex) => ({
      id: `${item.orderDetailsId}-version-${versionIndex + 1}`,
      label: versionIndex + 1,
      imageUrl: getOrderCardArtwork(cardIndex + versionIndex),
      content: { receiver: version.receiver, sender: version.sender, message: version.message },
      createdAt: version.createdAt
    }))

    const selected = versions[versions.length - 1]

    return {
      id: `${item.orderDetailsId}-card`,
      orderDetailsId: item.orderDetailsId,
      productName: item.name,
      productImageUrl: item.coverImage,
      templateId: seed.templateId,
      sizeId: seed.sizeId,
      quantity: seed.quantity,
      paidUnitPrice: getCardUnitPrice({
        sizeId: seed.sizeId,
        messageLength: selected.content.message.length,
        writingMethod: seed.writingMethod
      }),
      writingMethod: seed.writingMethod,
      selectedVersionId: selected.id,
      versions
    }
  })
