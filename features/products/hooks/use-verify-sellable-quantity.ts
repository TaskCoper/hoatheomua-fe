'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { SELLABLE_QUANTITY_QUERY_PREFIX, sellableQuantityQuery } from '../queries'
import { buildSellableQuantityMap, withLiveStock } from '../stock'
import type { ProductDetail, ProductSellableQuantity, ProductSummary } from '../types'

export interface SellableQuantityRequest {
  productId: string
  quantity: number
  productName?: string | null
}

export interface SellableQuantityShortage {
  productId: string
  productName: string | null
  requested: number
  available: number
}

export interface SellableQuantityVerdict {
  ok: boolean
  shortages: SellableQuantityShortage[]
  sellableQuantityById: Map<string, number>
}

const OK: SellableQuantityVerdict = { ok: true, shortages: [], sellableQuantityById: new Map() }

/**
 * Re-reads stock from the API and refuses the purchase when the wanted amount no
 * longer fits. Product, cart and checkout pages all render from caches that can be
 * an hour old, so this runs at the moment of intent - add to cart, buy now, and
 * checkout - rather than trusting whatever number is on screen.
 */
export const useVerifySellableQuantity = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isVerifyingSellableQuantity, setIsVerifying] = useState(false)

  // Fresh numbers are pushed back into every cache that renders stock, so a product
  // page or cart open in this tab re-renders against the truth we just fetched.
  const syncCaches = useCallback(
    (quantityById: Map<string, number>) => {
      if (quantityById.size === 0) return

      queryClient.setQueriesData<ProductSellableQuantity[]>({ queryKey: SELLABLE_QUANTITY_QUERY_PREFIX }, (rows) =>
        rows?.map((row) => (quantityById.has(row.id) ? { ...row, sellableQuantity: quantityById.get(row.id)! } : row))
      )

      // `['product']` and `['product-summary']` are separate caches, and the cart,
      // checkout review and product page are split across them.
      queryClient.setQueriesData<ProductDetail>({ queryKey: ['product'] }, (product) =>
        product ? withLiveStock(product, quantityById) : product
      )

      queryClient.setQueriesData<ProductSummary>({ queryKey: ['product-summary'] }, (summary) => {
        const live = summary ? quantityById.get(summary.id) : undefined
        return summary && live !== undefined && live !== summary.sellableQuantity
          ? { ...summary, sellableQuantity: live }
          : summary
      })
    },
    [queryClient]
  )

  const verifySellableQuantity = useCallback(
    async (requests: SellableQuantityRequest[], { notify = true } = {}): Promise<SellableQuantityVerdict> => {
      // Several cart lines can point at the same product, and the API only cares
      // about the total being asked for.
      const wanted = new Map<string, SellableQuantityRequest>()
      requests.forEach((request) => {
        if (!request.productId || request.quantity <= 0) return
        const current = wanted.get(request.productId)
        wanted.set(request.productId, {
          productId: request.productId,
          quantity: (current?.quantity ?? 0) + request.quantity,
          productName: current?.productName ?? request.productName ?? null
        })
      })

      const productIds = Array.from(wanted.keys())
      if (productIds.length === 0) return OK

      setIsVerifying(true)

      try {
        const rows = await queryClient.fetchQuery({ ...sellableQuantityQuery(productIds), staleTime: 0 })
        const sellableQuantityById = buildSellableQuantityMap(rows)
        const nameById = new Map(rows.map((row) => [row.id, row.productName ?? null]))
        syncCaches(sellableQuantityById)

        const shortages: SellableQuantityShortage[] = []
        wanted.forEach((request, productId) => {
          const available = sellableQuantityById.get(productId)
          // A product the endpoint says nothing about is unknown, not sold out -
          // blocking on it would turn a partial response into a dead checkout.
          if (available === undefined || request.quantity <= available) return
          shortages.push({
            productId,
            productName: request.productName ?? nameById.get(productId) ?? null,
            requested: request.quantity,
            available
          })
        })

        if (notify && shortages.length > 0) {
          toast.error(t('products.stock.changed'), {
            description: shortages
              .map((shortage) => {
                const name = shortage.productName ?? t('products.stock.unnamed')
                return shortage.available === 0
                  ? t('products.stock.soldOutLine', { name })
                  : t('products.stock.remainingLine', { name, available: shortage.available })
              })
              .join('\n')
          })
        }

        return { ok: shortages.length === 0, shortages, sellableQuantityById }
      } catch {
        // The API is the final authority and will reject an oversold order anyway;
        // a network blip here must not lock every buyer out of the cart.
        return OK
      } finally {
        setIsVerifying(false)
      }
    },
    [queryClient, syncCaches, t]
  )

  return { verifySellableQuantity, isVerifyingSellableQuantity }
}
