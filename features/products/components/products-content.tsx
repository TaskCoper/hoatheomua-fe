'use client'

import ProductsCategorySections from '@/features/products/components/products-category-sections'
import ProductsHeroSection from '@/features/products/components/products-hero-section'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { BANNER_SLOTS } from '@/types/config.type'
import dynamic from 'next/dynamic'

const FloatingPetals = dynamic(() => import('@/shared/components/floating-petals'), { ssr: false })

export default function ProductsContent() {
  return (
    <div className='relative overflow-hidden'>
      <ProductsHeroSection />

      {/* <ProductsOccasionsSection /> */}

      <ProductsCategorySections />

      <ProductsPromiseSection slot={BANNER_SLOTS.products} />

      <FloatingPetals />
    </div>
  )
}
