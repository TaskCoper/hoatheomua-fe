'use client'

import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import productService from '@/features/products/services'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { isGuestAuthPath } from '@/shared/constants'
import { isFeatureEnabled } from '@/shared/feature-flags'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import axios from 'axios'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAccountPhoneNumber } from '../hooks/use-account-phone-number'
import { useGetMe } from '../hooks/use-get-me'
import { clearPendingAction, getReplayGate } from '../pending-action'
import { replayPendingAction, type ReplayContext } from '../pending-action-handlers'

const fetchPurchasableProduct: ReplayContext['getProduct'] = async (productId) => {
  try {
    const [rows, detail] = await Promise.all([
      productService.getProductsSellableQuantity({ productIds: [productId] }),
      productService.getProduct({ id: productId }).catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null
        throw error
      })
    ])

    const row = rows.find((candidate) => candidate.id === productId)
    if (!row) return null

    return {
      productName: row.productName,
      hasVariants: (detail?.children ?? []).some((child) => Boolean(child?.id))
    }
  } catch {
    return null
  }
}

export default function PendingActionReplayer() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const mounted = useHasMounted()

  const { isAuthenticated, isGettingMe, canUseStorefront } = useGetMe()
  const { hasPhoneNumber } = useAccountPhoneNumber()
  const { verifySellableQuantity } = useVerifySellableQuantity()
  const notifyUnavailable = useFeatureUnavailableToast()
  const hasCartHydrated = useCartStore((state) => state.hasHydrated)

  const sawAuthPageRef = useRef(false)

  // The auth modal is a route over the page that opened it, with this layout still mounted
  // beneath - the pathname says `/sign-in` while the product page is still there.
  const isOnAuthPage = isGuestAuthPath(pathname)

  useEffect(() => {
    // `addItem` before the persisted cart is read back would be overwritten by it, hence `hasCartHydrated`.
    const gate = getReplayGate({
      mounted,
      isOnAuthPage,
      isGettingMe,
      isAuthenticated,
      hasCartHydrated,
      sawAuthPage: sawAuthPageRef.current
    })

    if (gate === 'onAuthPage') {
      sawAuthPageRef.current = true
      return
    }

    if (gate === 'cancelled') {
      // Back from the auth pages without a session: the visitor cancelled, so forget the intent.
      sawAuthPageRef.current = false
      clearPendingAction()
      return
    }

    if (gate === 'wait') return

    void replayPendingAction(
      {
        t,
        toast,
        verifySellableQuantity,
        getInCartQuantity: (lineId) =>
          useCartStore.getState().items.find((item) => item.lineId === lineId)?.quantity ?? 0,
        addItem: (input) => useCartStore.getState().addItem(input),
        setCheckoutIntent: (items, source) => useCheckoutIntentStore.getState().setIntent(items, source),
        navigate: (href) => router.push(href),
        canUseStorefront,
        canBuyNow: isFeatureEnabled('ordering'),
        hasPhoneNumber,
        notifyUnavailable,
        getProduct: fetchPurchasableProduct
      },
      pathname
    ).then((result) => {
      if (result === 'failed') toast.error(t('error.somethingWentWrong'))
    })
  }, [
    mounted,
    isOnAuthPage,
    isGettingMe,
    isAuthenticated,
    hasCartHydrated,
    canUseStorefront,
    hasPhoneNumber,
    pathname,
    router,
    t,
    verifySellableQuantity,
    notifyUnavailable
  ])

  return null
}
