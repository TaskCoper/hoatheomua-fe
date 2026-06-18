'use client'

import type { Product } from '@/features/products/types'
import dynamic from 'next/dynamic'
import ProductsCatalogSection from './products-catalog-section'
import ProductsHeroSection from './products-hero-section'
import ProductsOccasionsSection from './products-occasions-section'
import ProductsPromiseSection from './products-promise-section'

const FloatingPetals = dynamic(() => import('../../_components/floating-petals'), { ssr: false })

export default function ProductsContent({
  initialItems,
  initialNextCursor
}: {
  initialItems: Product[]
  initialNextCursor: number
}) {
  return (
    <div className='relative overflow-hidden'>
      <ProductsHeroSection />

      <ProductsOccasionsSection />

      <ProductsCatalogSection initialItems={initialItems} initialNextCursor={initialNextCursor} />

      <ProductsPromiseSection />

      <FloatingPetals />
    </div>
  )
}
