'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import productService from '../services'
import type { CoreMaterialShortage } from '../types'

export interface CoreProductRequest {
  productId: string
  quantity: number
  productName?: string | null
}

export interface CoreProductVerdict {
  ok: boolean
  shortages: CoreMaterialShortage[]
  /** Products the API blamed, so a caller can strike them off its own list. */
  blockedProductIds: Set<string>
}

const OK: CoreProductVerdict = { ok: true, shortages: [], blockedProductIds: new Set() }

/**
 * Asks whether the wanted products can actually be assembled. Stock counts finished
 * bouquets, this counts the materials they are built from, and nothing on screen
 * reflects material levels - so it runs at the moment of intent: add to cart, buy
 * now, estimate and create order.
 */
export const useCheckCoreProducts = () => {
  const { t } = useTranslation()
  const [isCheckingCoreProducts, setIsChecking] = useState(false)

  const checkCoreProducts = useCallback(
    async (requests: CoreProductRequest[], { notify = true } = {}): Promise<CoreProductVerdict> => {
      // Several cart lines can point at the same product; materials are consumed by the total.
      const wanted = new Map<string, number>()
      requests.forEach((request) => {
        if (!request.productId || request.quantity <= 0) return
        wanted.set(request.productId, (wanted.get(request.productId) ?? 0) + request.quantity)
      })

      if (wanted.size === 0) return OK

      setIsChecking(true)

      try {
        const shortages = await productService.checkCoreProducts({
          items: Array.from(wanted, ([productId, quantity]) => ({ productId, quantity }))
        })

        if (shortages.length === 0) return OK

        const blockedProductIds = new Set<string>()
        shortages.forEach((shortage) =>
          shortage.affectedProducts?.forEach((product) => {
            if (product?.productId) blockedProductIds.add(product.productId)
          })
        )

        if (notify) {
          // Material names and counts are internal stock detail - the buyer only
          // needs to know the order cannot be prepared right now.
          toast.error(t('products.core.unavailable'), { description: t('products.core.unavailableHint') })
        }

        return { ok: false, shortages, blockedProductIds }
      } catch {
        // The API rejects an unmakeable order anyway - a blip here must not block every buyer.
        return OK
      } finally {
        setIsChecking(false)
      }
    },
    [t]
  )

  return { checkCoreProducts, isCheckingCoreProducts }
}
