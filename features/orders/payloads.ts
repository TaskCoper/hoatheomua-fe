import type { ProductSummary } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import type { CardWritingMethod, CheckoutCard, CheckoutCardType } from './cards/types'
import type {
  CheckoutItemPayload,
  CheckoutPayload,
  CheckoutSelection,
  EstimatePayload,
  OrderBouquetPayload,
  OrderCardPayload
} from './types'
import { OrderCardFormType, OrderCardType, PaymentGatewayCode } from './types'
import type { CheckoutFormValues, EstimateFormValues } from './validations'

export interface OrderContact {
  fullName: string
  phone: string
}

export const toOrderTimestamp = (value: string | null): number => {
  if (!value) {
    return 0
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  if (date.toDateString() === new Date().toDateString()) {
    return 0
  }

  return Math.floor(date.getTime() / 1000)
}

export const buildEstimatePayload = (
  values: EstimateFormValues,
  items: CartItem[],
  productById: Map<string, ProductSummary>,
  contact: OrderContact
): EstimatePayload => {
  const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`

  return {
    latitude: values.latitude,
    longitude: values.longitude,
    address: fullAddress,
    shortAddress: fullAddress,
    fullName: contact.fullName,
    phone: contact.phone,
    remarks: values.remarks,
    orderTime: toOrderTimestamp(values.orderTime),
    items: items.map((item) => ({
      itemId: productById.get(item.productId)?.nhanhProductId ?? item.productId,
      productId: item.productId,
      number: item.quantity
    })),
    tagIds: values.tagIds
  }
}

const CARD_TYPE_CODE: Record<CheckoutCardType, OrderCardType> = {
  standard: OrderCardType.Handmade,
  ai: OrderCardType.Ai,
  // A reused card is an AI card - `sourceGeneratedCardId` is what says which generation.
  history: OrderCardType.Ai
}

const CARD_FORM_TYPE_CODE: Record<CardWritingMethod, OrderCardFormType> = {
  typed: OrderCardFormType.GoMay,
  handwritten: OrderCardFormType.Calligraphy
}

const toOrderCardPayload = (card: CheckoutCard): OrderCardPayload => ({
  cardType: CARD_TYPE_CODE[card.type],
  cardTemplateId: card.type === 'history' ? null : card.templateId,
  sizeName: card.type === 'standard' ? '' : card.sizeName,
  formType: card.type === 'standard' ? OrderCardFormType.Calligraphy : CARD_FORM_TYPE_CODE[card.writingMethod],
  messageContent: card.content.message,
  attachedImageUrl: card.type === 'ai' ? card.attachedImageUrl || null : null,
  sourceGeneratedCardId: card.type === 'history' ? card.generatedCardId : null
})

/** One bouquet per carded unit; a line with no cards sends none. */
const buildBouquetsByLineId = (cards: CheckoutCard[]): Map<string, OrderBouquetPayload[]> => {
  const bouquets = new Map<string, OrderBouquetPayload[]>()

  cards.forEach((card) => {
    const payload = toOrderCardPayload(card)
    const line = bouquets.get(card.lineId) ?? []

    for (let unit = 0; unit < card.quantity; unit++) {
      line.push({ card: payload })
    }

    bouquets.set(card.lineId, line)
  })

  return bouquets
}

export const buildCheckoutPayload = (
  values: CheckoutFormValues,
  items: CartItem[],
  productById: Map<string, ProductSummary>,
  contact: OrderContact,
  selection: CheckoutSelection
): CheckoutPayload => {
  const { paymentMethod, gateway, shippingGateway, shippingFee } = selection

  const estimate = buildEstimatePayload(values, items, productById, contact)
  const bouquetsByLineId = buildBouquetsByLineId(values.cards)

  // `buildEstimatePayload` maps `items` in order, so index `i` is still line `items[i]`.
  const checkoutItems: CheckoutItemPayload[] = estimate.items.map((item, index) => {
    const line = items[index]
    const bouquets = bouquetsByLineId.get(line.lineId) ?? []
    const generatedFlowerId = line.aiFlower?.generatedFlowerId

    // A bouquet designed in the studio says which design it is. TODO(backend): a design
    // ordered without a card sends no bouquet at all, so the id has nowhere to ride.
    return {
      ...item,
      bouquets: generatedFlowerId ? bouquets.map((bouquet) => ({ ...bouquet, generatedFlowerId })) : bouquets
    }
  })

  const base = {
    ...estimate,
    items: checkoutItems,
    fullNameReceiver: values.fullNameReceiver.trim(),
    phoneReceiver: values.phoneReceiver.trim()
  }

  const gateways = {
    paymentMethod,
    gateway,
    paymentGateway: PaymentGatewayCode[gateway],
    shippingGateway,
    shippingFee
  }

  if (!values.isExportInvoice) {
    return {
      ...base,
      taxCode: null,
      identityNumber: null,
      receiptFullName: null,
      receiptPhoneNumber: null,
      receiptAddress: null,
      receiptEmail: null,
      isExportInvoice: false,
      invoiceType: null,
      ...gateways
    }
  }

  return {
    ...base,
    taxCode: values.taxCode?.trim() ? values.taxCode : null,
    identityNumber: values.identityNumber?.trim() ? values.identityNumber : null,
    receiptFullName: values.receiptFullName?.trim() ? values.receiptFullName : null,
    receiptPhoneNumber: values.receiptPhoneNumber?.trim() ? values.receiptPhoneNumber : null,
    receiptAddress: values.receiptAddress?.trim() ? values.receiptAddress : null,
    receiptEmail: values.receiptEmail?.trim() ? values.receiptEmail : null,
    isExportInvoice: true,
    invoiceType: values.invoiceType,
    ...gateways
  }
}
