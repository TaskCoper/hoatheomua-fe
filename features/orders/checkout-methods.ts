import type { Locale } from '@/lib/i18n/types'
import type { JsonConfigItem, LocalizedText } from '@/types/config.type'
import {
  PaymentGateway,
  PaymentMethod,
  ShippingGateway,
  type PaymentGateway as PaymentGatewayValue,
  type ShippingGateway as ShippingGatewayValue,
  type ShippingQuote
} from './types'

export const CHECKOUT_CONFIG_GROUP = 'checkout'
export const CHECKOUT_PAYMENT_METHODS_KEY = 'checkout.payment_methods'
export const CHECKOUT_DELIVERY_METHODS_KEY = 'checkout.delivery_methods'

export type CheckoutMethodKind = 'payment' | 'delivery'

export interface CheckoutMethodPresentation {
  id: string
  enabled: boolean
  isDefault: boolean
  label: LocalizedText
  description: LocalizedText
}

export interface CheckoutMethodsCollection {
  items: CheckoutMethodPresentation[]
}

export interface PaymentMethodDefinition {
  id: string
  gateway: PaymentGatewayValue
  paymentMethod: PaymentMethod
  label: LocalizedText
  description: LocalizedText
}

export interface DeliveryMethodDefinition {
  id: string
  serviceId: string
  shippingGateway: ShippingGatewayValue
  label: LocalizedText
  description: LocalizedText
}

export interface CheckoutPaymentOption extends PaymentMethodDefinition {
  enabled: boolean
  isDefault: boolean
}

export interface CheckoutDeliveryOption extends DeliveryMethodDefinition {
  enabled: boolean
  isDefault: boolean
  // Undefined until step 1 is submitted - the carrier is chosen before anything
  // has been priced, and only the estimated carrier's options carry a quote.
  quote: ShippingQuote | undefined
}

export const PAYMENT_METHOD_REGISTRY: readonly PaymentMethodDefinition[] = [
  {
    id: 'baokim-va',
    gateway: PaymentGateway.BaoKim,
    paymentMethod: PaymentMethod[1],
    label: { vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer' },
    description: {
      vi: 'Thanh toán qua tài khoản định danh của Bảo Kim.',
      en: 'Pay through a BaoKim virtual account.'
    }
  },
  {
    id: 'sepay-vnpay-qr',
    gateway: PaymentGateway.Sepay,
    paymentMethod: PaymentMethod[6],
    label: { vi: 'Quét mã VietQR', en: 'VietQR payment' },
    description: {
      vi: 'Quét mã QR bằng ứng dụng ngân hàng của bạn.',
      en: 'Scan a QR code with your banking app.'
    }
  }
]

export const DELIVERY_METHOD_REGISTRY: readonly DeliveryMethodDefinition[] = [
  {
    id: 'ahamove-sgn-bike',
    serviceId: 'SGN-BIKE',
    shippingGateway: ShippingGateway.Ahamove,
    label: { vi: 'Ahamove xe máy', en: 'Ahamove Bike' },
    description: { vi: 'Giao hoa nhanh bằng xe máy.', en: 'Fast flower delivery by motorbike.' }
  },
  {
    id: 'xanhsm-bike',
    serviceId: 'SGN-BIKE',
    shippingGateway: ShippingGateway.XanhSm,
    label: { vi: 'Xanh SM xe máy', en: 'Xanh SM Bike' },
    description: { vi: 'Giao hoa bằng xe máy điện Xanh SM.', en: 'Flower delivery by Xanh SM electric bike.' }
  }
]

export type CheckoutPaymentMethodsConfigItem = JsonConfigItem<
  typeof CHECKOUT_PAYMENT_METHODS_KEY,
  typeof CHECKOUT_CONFIG_GROUP
>

export type CheckoutDeliveryMethodsConfigItem = JsonConfigItem<
  typeof CHECKOUT_DELIVERY_METHODS_KEY,
  typeof CHECKOUT_CONFIG_GROUP
>

const asLocalizedText = (raw: unknown, fallback: LocalizedText): LocalizedText => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback
  const value = raw as Partial<LocalizedText>
  return {
    vi: typeof value.vi === 'string' && value.vi.trim() ? value.vi.trim() : fallback.vi,
    en: typeof value.en === 'string' && value.en.trim() ? value.en.trim() : fallback.en
  }
}

const registryFor = (kind: CheckoutMethodKind) =>
  kind === 'payment' ? PAYMENT_METHOD_REGISTRY : DELIVERY_METHOD_REGISTRY

export const defaultCheckoutMethods = (kind: CheckoutMethodKind): CheckoutMethodsCollection => ({
  items: registryFor(kind).map((item, index) => ({
    id: item.id,
    enabled: true,
    isDefault: index === 0,
    label: item.label,
    description: item.description
  }))
})

export const parseCheckoutMethods = (raw: unknown, kind: CheckoutMethodKind): CheckoutMethodsCollection | null => {
  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const rawItems = (parsed as { items?: unknown }).items
  if (!Array.isArray(rawItems)) return null

  const registry = registryFor(kind)
  const definitions = new Map(registry.map((item) => [item.id, item]))
  const seen = new Set<string>()
  const items: CheckoutMethodPresentation[] = []

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) continue
    const item = rawItem as Partial<CheckoutMethodPresentation>
    if (typeof item.id !== 'string' || seen.has(item.id)) continue
    const definition = definitions.get(item.id)
    if (!definition) continue

    seen.add(item.id)
    items.push({
      id: item.id,
      enabled: item.enabled === true,
      isDefault: item.isDefault === true,
      label: asLocalizedText(item.label, definition.label),
      description: asLocalizedText(item.description, definition.description)
    })
  }

  for (const definition of registry) {
    if (seen.has(definition.id)) continue
    items.push({
      id: definition.id,
      enabled: false,
      isDefault: false,
      label: definition.label,
      description: definition.description
    })
  }

  const enabled = items.filter((item) => item.enabled)
  const defaultId = enabled.find((item) => item.isDefault)?.id ?? enabled[0]?.id

  return {
    items: items.map((item) => ({ ...item, isDefault: item.id === defaultId }))
  }
}

export const localizedMethodText = (text: LocalizedText, locale: Locale): string => text[locale] || text.vi || text.en
