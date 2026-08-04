'use client'

import type { ProductDetail } from '@/features/products/types'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

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

export const availableOf = (product: ProductDetail) => Math.floor(product.availableForSale ?? 0)

export function ProductVariantProvider({ product, children }: { product: ProductDetail; children: ReactNode }) {
  const variants = useMemo(
    () => (product.children ?? []).filter((child): child is ProductDetail => Boolean(child?.id)),
    [product.children]
  )

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (!variants.length) return product.id
    return (variants.find((child) => availableOf(child) > 0) ?? variants[0]).id
  })

  const selected = useMemo(
    () => variants.find((child) => child.id === selectedId) ?? product,
    [variants, selectedId, product]
  )

  const value = useMemo<ProductVariantContextValue>(
    () => ({ product, variants, hasVariants: variants.length > 0, selectedId, selected, setSelectedId }),
    [product, variants, selectedId, selected]
  )

  return <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>
}

export function useProductVariant() {
  const ctx = useContext(ProductVariantContext)
  if (!ctx) throw new Error('useProductVariant must be used within a ProductVariantProvider')
  return ctx
}
