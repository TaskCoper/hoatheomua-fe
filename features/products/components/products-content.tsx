'use client'

import ProductsCatalogSection from '@/features/products/components/products-catalog-section'
import ProductsHeroSection from '@/features/products/components/products-hero-section'
import ProductsOccasionsSection from '@/features/products/components/products-occasions-section'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { DAILY_FLOWER_CATEGORY_IDS, VASE_CATEGORY_IDS } from '@/features/products/constants'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { BANNER_SLOTS } from '@/types/config.type'
import { motion, type Variants } from 'motion/react'
import dynamic from 'next/dynamic'

const FloatingPetals = dynamic(() => import('@/shared/components/floating-petals'), { ssr: false })

const promptReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function ProductsContent() {
  const { t } = useTranslation()

  return (
    <div className='relative overflow-hidden'>
      <ProductsHeroSection />

      <ProductsOccasionsSection />

      <ProductsCatalogSection
        titleKey='products.catalog.vaseFlowers.title'
        descriptionKey='products.catalog.vaseFlowers.description'
        categoryIds={DAILY_FLOWER_CATEGORY_IDS}
      />

      <div className='px-4'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-80px' }}
          variants={promptReveal}
          className='mx-auto mt-2 flex w-full max-w-7xl items-center justify-center gap-3 px-4 sm:mt-4 md:mt-6 lg:mt-8 bg-secondary/50 py-10 rounded-2xl'
        >
          <p className='text-center font-title text-sm italic leading-relaxed text-primary sm:text-base md:text-lg'>
            {t('products.catalog.vaseFlowers.prompt')}
          </p>
        </motion.div>
      </div>

      <ProductsCatalogSection
        titleKey='products.catalog.title'
        descriptionKey='products.catalog.description'
        categoryIds={VASE_CATEGORY_IDS}
      />

      <ProductsPromiseSection slot={BANNER_SLOTS.products} />

      <FloatingPetals />
    </div>
  )
}
