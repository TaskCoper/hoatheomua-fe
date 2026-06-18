'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import banner from '@/public/images/banner.png'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from './sparkle-dividier'

const WHY_CHOOSE_FEATURES = [
  {
    number: '01',
    titleKey: 'home.whyChooseUs.features.fresh.title',
    descriptionKey: 'home.whyChooseUs.features.fresh.description',
    className: 'lg:left-16 lg:top-18 xl:left-24 xl:top-22'
  },
  {
    number: '02',
    titleKey: 'home.whyChooseUs.features.natural.title',
    descriptionKey: 'home.whyChooseUs.features.natural.description',
    className: 'lg:-right-2 lg:top-18 xl:right-20 xl:top-22 2xl:right-18 2xl:top-22'
  },
  {
    number: '03',
    titleKey: 'home.whyChooseUs.features.care.title',
    descriptionKey: 'home.whyChooseUs.features.care.description',
    className: 'lg:left-28 lg:bottom-18 xl:left-50 xl:bottom-22 2xl:left-52 2xl:bottom-22'
  },
  {
    number: '04',
    titleKey: 'home.whyChooseUs.features.refund.title',
    descriptionKey: 'home.whyChooseUs.features.refund.description',
    className: 'lg:right-10 lg:bottom-18 xl:right-20 xl:bottom-22 2xl:right-28 2xl:bottom-22'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 16 }
  }
}

export default function WhyChooseUsSection() {
  const { t } = useTranslation()

  return (
    <div className='space-y-2 overflow-hidden px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 mt-4 sm:mt-6 md:mt-8 lg:mt-10'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('home.whyChooseUs.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('home.whyChooseUs.description')}
        </p>
      </motion.div>

      <section className='relative mx-auto w-full max-w-7xl lg:h-160 lg:overflow-hidden xl:h-176 2xl:h-192'>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className='mx-auto lg:absolute lg:left-1/2 lg:top-0 lg:-translate-x-1/2'
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 0.6, 0, -0.6, 0] }}
            transition={{
              y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 10, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <Image
              src={banner}
              alt={t('home.whyChooseUs.bannerAlt')}
              className='mx-auto h-64 w-auto max-w-none object-contain lg:h-160 xl:h-176 2xl:h-192'
              sizes='(min-width: 1280px) 44rem, (min-width: 1024px) 40rem, 16rem'
              loading='lazy'
              quality={70}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={cardStagger}
          className='mt-8 grid grid-cols-1 gap-4 mb-8 lg:mb-0 lg:mt-0 lg:block lg:gap-0'
        >
          {WHY_CHOOSE_FEATURES.map((feature) => (
            <motion.div
              key={feature.number}
              variants={cardItem}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className={`group relative lg:absolute lg:z-10 lg:w-64 xl:w-72 2xl:w-80 ${feature.className}`}
            >
              <motion.span
                whileHover={{ scale: 1.15, rotate: 4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                className='pointer-events-none absolute -left-4 -top-6 -z-10 font-title text-6xl font-bold leading-none text-primary/10 transition-colors group-hover:text-primary/25 lg:-left-16 lg:-top-8 lg:text-8xl xl:-left-20 xl:-top-10 xl:text-9xl 2xl:-left-24 2xl:-top-12 2xl:text-[9rem]'
              >
                {feature.number}
              </motion.span>
              <h2 className='font-title text-lg font-bold leading-tight text-primary lg:text-2xl 2xl:text-3xl'>
                {t(feature.titleKey)}
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-foreground xl:text-sm'>{t(feature.descriptionKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
