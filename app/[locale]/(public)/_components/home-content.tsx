'use client'

import type { Product } from '@/features/products/types'
import bannerOne from '@/public/images/banner-one.png'
import saleBanner from '@/public/images/sale-banner.png'
import { motion, type Variants } from 'motion/react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import CriteriaSection from './criteria-section'
import HeroSection from './hero-section'
import ShopFreshFlowersSection from './shop-fresh-flowers-section'
import SignatureBouquetsSection from './signature-bouquets-section'
import TestimonialSection from './testimonial-section'
import WhyChooseUsSection from './why-choose-us-section'

const FloatingPetals = dynamic(() => import('./floating-petals'), { ssr: false })

const bannerReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function HomeContent({
  signatureBouquets,
  signatureBouquetsNextCursor
}: {
  signatureBouquets: Product[]
  signatureBouquetsNextCursor: number
}) {
  return (
    <div className='relative overflow-hidden'>
      <HeroSection />

      <CriteriaSection />

      <ShopFreshFlowersSection />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={bannerReveal}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className='mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'
      >
        <Image
          src={bannerOne}
          alt='Bộ sưu tập hoa tươi Hoa Theo Mùa'
          className='w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg border-2 border-secondary/80'
          sizes='(min-width: 1280px) 1200px, 100vw'
          loading='lazy'
          quality={65}
        />
      </motion.div>

      <SignatureBouquetsSection initialItems={signatureBouquets} initialNextCursor={signatureBouquetsNextCursor} />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={bannerReveal}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className='mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'
      >
        <Image
          src={saleBanner}
          alt='Ưu đãi hoa tươi Hoa Theo Mùa'
          className='w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg border-2 border-primary/5'
          sizes='(min-width: 1280px) 1200px, 100vw'
          loading='lazy'
          quality={65}
        />
      </motion.div>

      <WhyChooseUsSection />

      <TestimonialSection />

      <FloatingPetals />
    </div>
  )
}
