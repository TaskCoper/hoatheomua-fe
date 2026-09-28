'use client'

import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import type { StudioTrim } from '@/features/studio/types'
import { useAccountPhoneNumber } from '@/features/users/hooks/use-account-phone-number'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { isFeatureEnabled } from '@/shared/feature-flags'
import { buildLineId, useCartStore, type CartAiFlower, type CartAiFlowerTrim, type CartItem } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

const NO_OPTIONS = {}

interface UseStudioPurchaseArgs {
  productId: string
  productName: string
  designName: string
  rootProductId: string
  sessionId: string
  flowerId: string
  unitPrice: number
  ribbon?: StudioTrim | null
  wrap?: StudioTrim | null
  isPriceResolving?: boolean
}

const toCartTrim = (trim: StudioTrim | null | undefined): CartAiFlowerTrim | null =>
  trim ? { productId: trim.id, name: trim.name, imageUrl: trim.imageUrl, priceAmount: trim.priceAmount ?? 0 } : null

export const useStudioPurchase = ({
  productId,
  productName,
  designName,
  rootProductId,
  sessionId,
  flowerId,
  unitPrice,
  ribbon,
  wrap,
  isPriceResolving = false
}: UseStudioPurchaseArgs) => {
  const { t } = useTranslation()
  const router = useRouter()

  const isReady = Boolean(productId && flowerId)

  const { isGettingMe, me } = useGetMe()
  const { hasPhoneNumber, isLoading: isLoadingPhoneNumber } = useAccountPhoneNumber({ enabled: isReady })
  const { verifySellableQuantity, isVerifyingSellableQuantity } = useVerifySellableQuantity()

  const addItem = useCartStore((state) => state.addItem)
  const setCheckoutIntent = useCheckoutIntentStore((state) => state.setIntent)

  const canBuyNow = isFeatureEnabled('ordering')
  const notifyUnavailable = useFeatureUnavailableToast()

  const [added, setAdded] = useState(false)

  const aiFlower = useMemo<CartAiFlower>(
    () => ({
      generatedFlowerId: flowerId,
      sessionId,
      rootProductId,
      unitPrice,
      ribbon: toCartTrim(ribbon),
      wrap: toCartTrim(wrap)
    }),
    [flowerId, ribbon, rootProductId, sessionId, unitPrice, wrap]
  )

  const lineId = useMemo(() => buildLineId(productId, null, NO_OPTIONS, flowerId), [productId, flowerId])
  const inCartQuantity = useCartStore((state) => state.items.find((item) => item.lineId === lineId)?.quantity ?? 0)

  const isBusy = isGettingMe || isVerifyingSellableQuantity || isPriceResolving || isLoadingPhoneNumber
  const isPhoneMissing = !isLoadingPhoneNumber && !hasPhoneNumber

  const resetAdded = useCallback(() => setAdded(false), [])

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
