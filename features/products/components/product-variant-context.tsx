'use client'

import { useGetProductsSellableQuantity } from '@/features/products/hooks/use-get-products-sellable-quantity'
import { toSellableQuantity, withLiveStock } from '@/features/products/stock'
import type { ProductDetail } from '@/features/products/types'
import { useSearchParams } from 'next/navigation'
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const VARIANT_QUERY_KEY = 'variant'

export const buildProductVariantHref = (parentId: string, variantId?: string | null) =>
  variantId ? `/products/${parentId}?${VARIANT_QUERY_KEY}=${encodeURIComponent(variantId)}` : `/products/${parentId}`

interface ProductVariantContextValue {
  /** The parent/grouping product row. */
  product: ProductDetail
  /** Sellable variant children (each a full product row). */
  variants: ProductDetail[]
  hasVariants: boolean
  selectedId: string
  /** The currently selected variant, or the parent when there are no variants. */
  selected: ProductDetail
  setSelectedId: (id: string) => void
}

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null)

export const availableOf = (product: ProductDetail) => toSellableQuantity(product.sellableQuantity)

const sellableChildren = (product: ProductDetail) =>
  (product.children ?? []).filter((child): child is ProductDetail => Boolean(child?.id))

export function ProductVariantProvider({
  product: staticProduct,
  children
}: {
  product: ProductDetail
  children: ReactNode
}) {
  // The page ships as statically generated HTML with an hourly revalidate window,
  // so the stock baked into `staticProduct` can be badly out of date by the time
  // someone reads it. Re-fetch it for this product and every variant on mount and
  // overlay the result, which rebuilds the purchase box in place.
  const productIds = useMemo(
    () => [staticProduct.id, ...sellableChildren(staticProduct).map((child) => child.id)],
    [staticProduct]
  )

  const { sellableQuantityById } = useGetProductsSellableQuantity({ productIds })

  const product = useMemo(
    () => withLiveStock(staticProduct, sellableQuantityById),
    [staticProduct, sellableQuantityById]
  )

  const variants = useMemo(() => sellableChildren(product), [product])

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (!variants.length) return product.id
    return (variants.find((child) => availableOf(child) > 0) ?? variants[0]).id
  })

  const selectFromQuery = useCallback(
    (id: string) => {
      setSelectedId((current) => (variants.some((child) => child.id === id) ? id : current))
    },
    [variants]
  )

  const selected = useMemo(
    () => variants.find((child) => child.id === selectedId) ?? product,
    [variants, selectedId, product]
  )

  const value = useMemo<ProductVariantContextValue>(
    () => ({ product, variants, hasVariants: variants.length > 0, selectedId, selected, setSelectedId }),
    [product, variants, selectedId, selected]
  )

  return (
    <ProductVariantContext.Provider value={value}>
      <Suspense fallback={null}>
        <VariantQuerySync onSelect={selectFromQuery} />
      </Suspense>
      {children}
    </ProductVariantContext.Provider>
  )
}

function VariantQuerySync({ onSelect }: { onSelect: (id: string) => void }) {
  const searchParams = useSearchParams()
  const requestedId = searchParams.get(VARIANT_QUERY_KEY)

  useEffect(() => {
    if (requestedId) onSelect(requestedId)
  }, [requestedId, onSelect])

  return null
}

export function useProductVariant() {
  const ctx = useContext(ProductVariantContext)
  if (!ctx) throw new Error('useProductVariant must be used within a ProductVariantProvider')
  return ctx
}
