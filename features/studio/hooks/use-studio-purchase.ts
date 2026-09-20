'use client'

import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import { useAccountPhoneNumber } from '@/features/users/hooks/use-account-phone-number'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { isFeatureEnabled } from '@/shared/feature-flags'
import { buildLineId, useCartStore, type CartAiFlower, type CartItem } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

const NO_OPTIONS = {}

interface UseStudioPurchaseArgs {
  /** The catalogue product the design was built on - what stock and the order price against. */
  productId: string
  productName: string
  /** What the buyer named the design - the bag confirmation says this back to them. */
  designName: string
  /** The family the studio was opened from, so the cart can link back to this sitting. */
  rootProductId: string
  sessionId: string
  /** The generated version on screen. Empty until a design finishes. */
  flowerId: string
  /** The studio's own quote: product plus the extra stems the buyer added. */
  unitPrice: number
}

/**
 * Add to bag / buy now for a bouquet designed in the studio. It is the product purchase
 * box's counterpart: the same stock re-check and checkout hand-off, but the line it
 * writes carries the generated flower so the cart, the studio link and the order all
 * know this is a design rather than a catalogue row.
 */
export const useStudioPurchase = ({
  productId,
  productName,
  designName,
  rootProductId,
  sessionId,
  flowerId,
  unitPrice
}: UseStudioPurchaseArgs) => {
  const { t } = useTranslation()
  const router = useRouter()

  const { isGettingMe, me } = useGetMe()
  const { hasPhoneNumber, isLoading: isLoadingPhoneNumber } = useAccountPhoneNumber()
  const { verifySellableQuantity, isVerifyingSellableQuantity } = useVerifySellableQuantity()

  const addItem = useCartStore((state) => state.addItem)
  const setCheckoutIntent = useCheckoutIntentStore((state) => state.setIntent)

  const canBuyNow = isFeatureEnabled('ordering')
  const notifyUnavailable = useFeatureUnavailableToast()

  const [added, setAdded] = useState(false)

  const aiFlower = useMemo<CartAiFlower>(
    () => ({ generatedFlowerId: flowerId, sessionId, rootProductId, unitPrice }),
    [flowerId, rootProductId, sessionId, unitPrice]
  )

  const lineId = useMemo(() => buildLineId(productId, null, NO_OPTIONS, flowerId), [productId, flowerId])
  const inCartQuantity = useCartStore((state) => state.items.find((item) => item.lineId === lineId)?.quantity ?? 0)

  const isReady = Boolean(productId && flowerId)
  const isBusy = isGettingMe || isVerifyingSellableQuantity
  const isPhoneMissing = !isLoadingPhoneNumber && !hasPhoneNumber

  const resetAdded = useCallback(() => setAdded(false), [])

  // A studio route is already behind the auth gate, so the only account state left to
  // check is the one ordering actually needs.
  const guardPurchase = () => {
    if (!isReady || isGettingMe) return false

    if (me && !me.isEmailVerified) {
      const verifyParams = me.email ? `?${new URLSearchParams({ email: me.email }).toString()}` : ''
      router.push(`/verify-sent${verifyParams}`)
      return false
    }

    return true
  }

  const addToBag = async () => {
    if (!guardPurchase()) return

    // What the bag already holds of this design counts against the same stock.
    const { ok } = await verifySellableQuantity([{ productId, productName, quantity: inCartQuantity + 1 }])
    if (!ok) return

    addItem({ productId, quantity: 1, aiFlower })
    setAdded(true)

    toast.success(t('products.detail.purchase.addedToCart'), { description: designName || productName })
  }

  const buyNow = async () => {
    if (!canBuyNow) {
      notifyUnavailable()
      return
    }

    if (!guardPurchase()) return

    if (!hasPhoneNumber) {
      toast.error(t('orders.checkout.contactMissing'))
      return
    }

    // Buy now checks out on its own, so only this one bouquet is at stake.
    const { ok } = await verifySellableQuantity([{ productId, productName, quantity: 1 }])
    if (!ok) return

    const now = new Date().toISOString()
    const item: CartItem = {
      lineId,
      productId,
      variantId: null,
      quantity: 1,
      selectedOptions: {},
      aiFlower,
      addedAt: now,
      updatedAt: now
    }

    setCheckoutIntent([item], 'buy-now')
    router.push('/checkout')
  }

  return {
    added,
    canPurchase: isReady,
    canBuyNow,
    isPhoneMissing,
    isPurchasing: isBusy,
    isAddToBagDisabled: !isReady || isBusy,
    isBuyNowDisabled: !isReady || isBusy || isPhoneMissing || !canBuyNow,
    addToBag,
    buyNow,
    resetAdded
  }
}
