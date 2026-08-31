import type { SortableCategory } from '@/features/categories/types'
import ProductsCategorySections from '@/features/products/components/products-category-sections'
import ProductsHeroSection from '@/features/products/components/products-hero-section'
import FloatingPetalsClient from '@/shared/components/floating-petals-client'
import type { ReactNode } from 'react'

// Server component: this is pure composition. The interactive/animated pieces
// (hero motion, category filters, product grids, floating petals) each declare
// their own 'use client' boundary, so nothing here ships as client JS.
export default function ProductsContent({
  categories,
  promiseSection
}: {
  categories: SortableCategory[]
  promiseSection: ReactNode
}) {
  return (
    <div className='relative overflow-hidden'>
      <ProductsHeroSection />

      {/* <ProductsOccasionsSection /> */}

      <ProductsCategorySections categories={categories} />

      {promiseSection}

      <FloatingPetalsClient />
    </div>
  )
}
