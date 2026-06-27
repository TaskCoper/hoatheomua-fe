'use client'

import dynamic from 'next/dynamic'
import ProductsCatalogSection from './products-catalog-section'
import ProductsOccasionsSection from './products-occasions-section'
import ProductsPromiseSection from './products-promise-section'

const FloatingPetals = dynamic(() => import('../../_components/floating-petals'), { ssr: false })

export default function ProductsContent() {
  return (
    <div className='relative overflow-hidden'>
      {/* <ProductsHeroSection /> */}

      <ProductsOccasionsSection />

      <ProductsCatalogSection />

      <ProductsPromiseSection />

      <FloatingPetals />
    </div>
  )
}
