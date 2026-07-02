'use client'

import bannerOne from '@/public/images/banner-one.png'
import saleBanner from '@/public/images/sale-banner.png'
import { BANNER_SLOTS } from '@/types/config.type'
import { motion, type Variants } from 'motion/react'
import dynamic from 'next/dynamic'
import ConfigurableBanner from './configurable-banner'
import CriteriaSection from './criteria-section'
import ShopFreshFlowersSection from './shop-fresh-flowers-section'
import SignatureBouquetsSection from './signature-bouquets-section'
import TestimonialSection from './testimonial-section'
import WhyChooseUsSection from './why-choose-us-section'

const FloatingPetals = dynamic(() => import('./floating-petals'), { ssr: false })

const bannerReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const bannerWrapperClass = 'mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'
const bannerImageClass = 'w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg'

export default function HomeContent() {
  return (
    <div className='relative overflow-hidden'>
      <CriteriaSection />

      <ShopFreshFlowersSection />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={bannerReveal}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className={bannerWrapperClass}
      >
        <ConfigurableBanner
          slot={BANNER_SLOTS.homeCollection}
          fallbackSrc={bannerOne}
          fallbackAlt='Bộ sưu tập hoa tươi Hoa Theo Mùa'
          className={`${bannerImageClass} border-2 border-secondary/80`}
          sizes='(min-width: 1280px) 1200px, 100vw'
        />
      </motion.div>

      <SignatureBouquetsSection />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={bannerReveal}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className={bannerWrapperClass}
      >
        <ConfigurableBanner
          slot={BANNER_SLOTS.homeSale}
          fallbackSrc={saleBanner}
          fallbackAlt='Ưu đãi hoa tươi Hoa Theo Mùa'
          className={`${bannerImageClass} border-2 border-primary/5`}
          sizes='(min-width: 1280px) 1200px, 100vw'
        />
      </motion.div>

      <WhyChooseUsSection />

      <TestimonialSection />

      <FloatingPetals />
    </div>
  )
}
