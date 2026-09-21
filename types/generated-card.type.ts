/**
 * A row of `GET v1/generated-cards` - every card this customer has generated, newest first.
 * Confirmed against the backend DTO: `cardType`/`formType` come back as the strings
 * `OrderSnapshotCardType` and `OrderSnapshotFormType` spell, and it carries the design it was
 * painted from, the printed size and the price paid.
 */
export interface GeneratedCardHistoryItem {
  id: string
  /** The card template the generation was painted from. */
  templateId: string
  /** `'ai' | 'handmade'` - see `OrderSnapshotCardType`. */
  cardType: string
  /** `'go_may' | 'calligraphy'` - see `OrderSnapshotFormType`. */
  formType: string
  imageUrl: string
  /** The artwork before the words were laid over it. */
  rawImage: string | null
  messageContent: string
  /** The photo the customer attached to the generation. */
  attachedImageUrl: string | null
  /** `CardSize.name` from `card_config.sizes`, and the centimetres it prints at. */
  sizeName: string
  sizeWidth: number
  sizeHeight: number
  totalPrice: number
  createdAt: string
}

/** Query of `GET v1/generated-cards` - the whole history, a page at a time. */
export interface GetGeneratedCardsParams {
  pageIndex?: number
  pageSize?: number
}

/** Body of `POST v1/generated-cards/by-products` - just the products whose cards are wanted; the endpoint returns everything, no paging. */
export interface GetGeneratedCardsByProductsPayload {
  productIds: string[]
}

/**
 * A card row inside `POST v1/generated-cards/by-products`'s response. Confirmed against the
 * backend DTO (`CardItemResponse`) - same shape as `GeneratedCardHistoryItem` plus `operation`,
 * `regeneratedFromCardId` and `isSelected`.
 */
export interface GeneratedCardByProductItem extends GeneratedCardHistoryItem {
  operation: string
  regeneratedFromCardId: string | null
  isSelected: boolean
}

/** One product's row of `POST v1/generated-cards/by-products` - the cards generated for it. */
export interface ProductGeneratedCards {
  productId: string
  generatedCards: GeneratedCardByProductItem[]
}
