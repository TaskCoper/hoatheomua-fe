import { OrderSnapshotCardType, OrderSnapshotFormType, type OrderItem, type OrderSnapshotCard } from '../types'
import type { CardWritingMethod, OrderAiCard, OrderCardVersion } from './types'

export const findOrderCardVersion = (versions: OrderCardVersion[], versionId: string): OrderCardVersion | null =>
  versions.find((version) => version.id === versionId) ?? null

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
        carded: itemCards.length,
        cards: itemCards
      }
    })
    .filter((group) => group.cards.length > 0)

/**
 * A snapshot card is what the customer paid to have printed. The API keeps the whole bouquet
 * snapshot in the same object; a card is there only when `snapShotCard` is, and it is worth
 * showing only once it carries either words or a design.
 */
const hasOrderedCard = (card: OrderSnapshotCard | null | undefined): card is OrderSnapshotCard =>
  !!card && !!card.virtualId && (!!card.messageContent?.trim() || !!card.cardTemplate?.templateId || !!card.cardId)

/** The printed shape of the card; the API sends centimetres, only their ratio matters here. */
const getSizeRatio = (card: OrderSnapshotCard): number | null => {
  const width = card.cardSize?.width ?? 0
  const height = card.cardSize?.height ?? 0

  return width > 0 && height > 0 ? width / height : null
}

/** `formType` is the only thing that says how the words go onto the card. */
const toWritingMethod = (formType: OrderSnapshotCard['formType']): CardWritingMethod =>
  formType === OrderSnapshotFormType.Calligraphy ? 'handwritten' : 'typed'

/**
 * How far the words may be rewritten. The size sets the budget that fits on the card, but the
 * price tier frozen in `cardConfig` is the tighter one: leaving it would change what the card
 * costs, and the order has already been paid.
 */
const getWordBudget = (card: OrderSnapshotCard): { minWords: number; maxWords: number } => {
  const caps = [card.cardSize?.maxWords, card.cardConfig?.maxWords].filter(
    (value): value is number => typeof value === 'number' && value > 0
  )

  return {
    minWords: Math.max(0, card.cardConfig?.minWords ?? 0),
    maxWords: caps.length > 0 ? Math.min(...caps) : 0
  }
}

/**
 * The cards printed for one line, read off the snapshot the order froze at checkout - one
 * metadata entry per unit bought, so a line bought twice carries two cards. They are kept
 * apart even when they look identical: each has its own `virtualId`, which is what the card
 * endpoints address, so two units can be regenerated into two different artworks.
 */
const toOrderItemAiCards = (item: OrderItem): OrderAiCard[] =>
  (item.snapshot?.productMetadata ?? []).flatMap((unit, index): OrderAiCard[] => {
    const snapshot = unit.snapShotCard
    if (!hasOrderedCard(snapshot)) return []

    const { minWords, maxWords } = getWordBudget(snapshot)

    return [
      {
        id: snapshot.virtualId as string,
        orderDetailsId: item.orderDetailsId,
        sourceCardId: snapshot.cardId,
        type: snapshot.cardType === OrderSnapshotCardType.Handmade ? 'handmade' : 'ai',
        productName: unit.name ?? item.name,
        productImageUrl: item.coverImage,
        templateId: snapshot.cardTemplate?.templateId ?? '',
        templateName: snapshot.cardTemplate?.templateName ?? '',
        templateImageUrl: snapshot.cardTemplate?.templateImageUrl ?? '',
        sizeName: snapshot.cardSize?.name ?? '',
        sizeRatio: getSizeRatio(snapshot),
        unit: index + 1,
        content: { message: snapshot.messageContent?.trim() ?? '' },
        minWords,
        maxWords,
        // What was actually charged, not what the current config would charge.
        paidUnitPrice: snapshot.totalPrice ?? (snapshot.basePrice ?? 0) + (snapshot.extraPrice ?? 0),
        writingMethod: toWritingMethod(snapshot.formType),
        selectedVersionId: snapshot.finalGeneratedCardId ?? ''
      }
    ]
  })

/** Every card of a placed order, in line order. */
export const buildOrderAiCards = (items: OrderItem[]): OrderAiCard[] => items.flatMap(toOrderItemAiCards)
