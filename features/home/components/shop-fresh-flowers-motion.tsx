'use client'

import FlowersCarousel from '@/features/home/components/flowers-carousel'
import type { CarouselProductsParams } from '@/features/products/section-defaults'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function ShopFreshFlowersMotion({
  title,
  description,
  productsParams
}: {
  title: string
  description: string
  productsParams: CarouselProductsParams | null
}) {
  return (
    <>
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

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>{title}</h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {description}
        </p>
      </motion.div>

      <FlowersCarousel params={productsParams} />
    </>
  )
}
