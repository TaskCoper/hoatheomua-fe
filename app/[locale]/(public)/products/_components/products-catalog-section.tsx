'use client'

import type { Product } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { motion, type Variants } from 'motion/react'
import { SparkleDivider } from '../../_components/sparkle-dividier'
import ProductGrid from './product-grid'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function ProductsCatalogSection({
  initialItems,
  initialNextCursor
}: {
  initialItems: Product[]
  initialNextCursor: number
}) {
  const { t } = useTranslation()

  return (
    <section id='all-products' className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('products.catalog.title')}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('products.catalog.description')}
        </p>
      </motion.div>

      <ProductGrid initialItems={initialItems} initialNextCursor={initialNextCursor} />
    </section>
  )
}
