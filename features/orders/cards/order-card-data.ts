import {
  OrderSnapshotCardType,
  OrderSnapshotFormType,
  type OrderDetailCardItem,
  type OrderItem,
  type OrderSnapshotCard
} from '../types'
import type { CardWritingMethod, OrderAiCard, OrderCardVersion } from './types'

/** `formType` is the only thing that says how the words go onto the card. */
const toWritingMethod = (formType: OrderSnapshotCard['formType']): CardWritingMethod =>
  formType === OrderSnapshotFormType.Calligraphy ? 'handwritten' : 'typed'

/**
 * The generations of one card, in the order the API lists them. The "Version n" labels are
 * that position - the endpoint sends no number of its own - so every reader has to number the
 * list the same way or the same artwork would be called two different things.
 */
export const toOrderCardVersions = (items: OrderDetailCardItem[]): OrderCardVersion[] =>
  items.map((item, index) => ({
    id: item.id,
    label: index + 1,
    name: item.name,
    imageUrl: item.imageUrl,
    templateId: item.templateId,
    content: { message: item.messageContent?.trim() ?? '' },
    writingMethod: toWritingMethod(item.formType)
  }))

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

/** The florist writes these by hand; `'ai'` is the kind designed in the studio. */
const isHandmadeCard = (card: OrderSnapshotCard): boolean => card.cardType === OrderSnapshotCardType.Handmade

/**
 * How far the words may be rewritten. Leaving the price tier frozen in `cardConfig` would change
 * what the card costs, and the order has already been paid - so it holds every card. A handmade
 * card is handwritten by definition and is ordered without a size, so that tier is the only thing
 * holding it; an AI card is held to its size as well, whichever of the two is tighter.
 */
const getWordBudget = (card: OrderSnapshotCard): { minWords: number; maxWords: number } => {
  const budgets = isHandmadeCard(card)
    ? [card.cardConfig?.maxWords]
    : [card.cardSize?.maxWords, card.cardConfig?.maxWords]

  const caps = budgets.filter((value): value is number => typeof value === 'number' && value > 0)

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
        type: isHandmadeCard(snapshot) ? 'handmade' : 'ai',
        // The line's product, not `unit.name`: a unit of an AI-customised bouquet is named after
        // the flower that was generated for it, which says nothing about what was bought. The
        // headline is read the way the item list reads it - a variant line carries its parent's
        // name, and its own `name` is only the variant label underneath.
        productName: item.parentProductName || item.name,
        productImageUrl: item.coverImage,
        templateId: snapshot.cardTemplate?.templateId ?? '',
        templateName: snapshot.cardTemplate?.templateName ?? '',
        templateImageUrl: snapshot.cardTemplate?.templateImageUrl ?? '',
        rawImageUrl: snapshot.rawImage ?? '',
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
