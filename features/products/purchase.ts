import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { buildLineId, MAX_QUANTITY, type AddCartItemInput, type CartItem } from '@/stores/cart.store'
import type { CheckoutIntentSource } from '@/stores/checkout-intent.store'
import type { SellableQuantityRequest, SellableQuantityVerdict } from './hooks/use-verify-sellable-quantity'

export interface PurchaseRequest {
  productId: string
  productName: string
  quantity: number
}

export interface PurchaseToast {
  success: (message: string, options?: { description?: string }) => unknown
  error: (message: string, options?: { description?: string }) => unknown
}

export interface PurchaseDeps {
  t: TranslationFunction
  toast: PurchaseToast
  verifySellableQuantity: (requests: SellableQuantityRequest[]) => Promise<Pick<SellableQuantityVerdict, 'ok'>>
  getInCartQuantity: (lineId: string) => number
  addItem: (input: AddCartItemInput) => unknown
  setCheckoutIntent: (items: CartItem[], source: CheckoutIntentSource) => void
  navigate: (href: '/checkout') => void
}

export const addToCart = async ({ productId, productName, quantity }: PurchaseRequest, deps: PurchaseDeps) => {
  const inCartQuantity = deps.getInCartQuantity(buildLineId(productId, null, {}))

  if (inCartQuantity + quantity > MAX_QUANTITY) {
    deps.toast.error(deps.t('products.detail.purchase.stockLimit'))
    return false
  }

  const { ok } = await deps.verifySellableQuantity([{ productId, productName, quantity: inCartQuantity + quantity }])
  if (!ok) return false

  deps.addItem({ productId, variantId: null, quantity, selectedOptions: {} })

  deps.toast.success(deps.t('products.detail.purchase.addedToCart'), { description: productName })
  return true
}

export const startBuyNow = async (
  { productId, productName, quantity }: PurchaseRequest,
  deps: PurchaseDeps & { hasPhoneNumber: boolean }
) => {
  if (!deps.hasPhoneNumber) {
    deps.toast.error(deps.t('orders.checkout.contactMissing'))
    return false
  }

  const { ok } = await deps.verifySellableQuantity([{ productId, productName, quantity }])
  if (!ok) return false

  const now = new Date().toISOString()
  deps.setCheckoutIntent(
    [
      {
        lineId: buildLineId(productId, null, {}),
        productId,
        variantId: null,
        quantity,
        selectedOptions: {},
        aiFlower: null,
        addedAt: now,
        updatedAt: now
      }
    ],
    'buy-now'
  )
  deps.navigate('/checkout')
  return true
}
