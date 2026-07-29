'use client'

import ProductsCategorySections from '@/features/products/components/products-category-sections'
import ProductsHeroSection from '@/features/products/components/products-hero-section'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const FloatingPetals = dynamic(() => import('@/shared/components/floating-petals'), { ssr: false })

export default function ProductsContent({ promiseSection }: { promiseSection: ReactNode }) {
  return (
    <div className='relative overflow-hidden'>
      <ProductsHeroSection />

      {/* <ProductsOccasionsSection /> */}

      <ProductsCategorySections />

      {promiseSection}

      <FloatingPetals />
    </div>
  )
}
