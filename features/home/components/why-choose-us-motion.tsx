'use client'

import banner from '@/public/images/banner.webp'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const WHY_CHOOSE_FEATURES = [
  { number: '01', key: 'fresh', className: 'lg:left-16 lg:top-18 xl:left-24 xl:top-22' },
  {
    number: '02',
    key: 'payment',
    className: 'lg:-right-2 lg:top-18 xl:right-20 xl:top-22 2xl:right-18 2xl:top-22'
  },
  {
    number: '03',
    key: 'warranty',
    className: 'lg:left-28 lg:bottom-18 xl:left-50 xl:bottom-22 2xl:left-52 2xl:bottom-22'
  },
  {
    number: '04',
    key: 'refund',
    className: 'lg:right-10 lg:bottom-18 xl:right-20 xl:bottom-22 2xl:right-28 2xl:bottom-22'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 16 } }
}

export type WhyChooseUsStrings = {
  title: string
  description: string
  bannerAlt: string
  features: Record<(typeof WHY_CHOOSE_FEATURES)[number]['key'], { title: string; description: string }>
}

export default function WhyChooseUsMotion({ strings }: { strings: WhyChooseUsStrings }) {
  return (
    <>
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

          {/* h2: the home page's single h1 is the "Hoa Mỗi Ngày" section heading. */}
          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {strings.title}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {strings.description}
        </p>
      </motion.div>

      <section className='relative mx-auto w-full max-w-7xl lg:h-160 lg:overflow-hidden xl:h-176 2xl:h-192'>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className='mx-auto lg:absolute lg:left-1/2 lg:top-0 lg:-translate-x-1/2'
        >
          <div className='banner-drift'>
            <Image
              src={banner}
              alt={strings.bannerAlt}
              className='mx-auto h-64 w-auto max-w-none object-contain lg:h-160 xl:h-176 2xl:h-192'
              sizes='(min-width: 1280px) 44rem, (min-width: 1024px) 40rem, 20rem'
              loading='lazy'
              quality={65}
            />
          </div>
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
              transition={{ type: 'spring', stiffness: 280, damping: 16 }}
              className={`group relative lg:absolute lg:z-10 lg:w-64 xl:w-72 2xl:w-80 ${feature.className}`}
            >
              <span className='pointer-events-none absolute -left-4 -top-6 -z-10 font-title text-6xl font-bold leading-none text-primary/10 transition-colors duration-300 group-hover:text-primary/25 lg:-left-16 lg:-top-8 lg:text-8xl xl:-left-20 xl:-top-10 xl:text-9xl 2xl:-left-24 2xl:-top-12 2xl:text-[9rem]'>
                {feature.number}
              </span>
              <h2 className='font-title text-lg font-bold leading-tight text-primary lg:text-2xl 2xl:text-3xl'>
                {strings.features[feature.key].title}
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-foreground xl:text-sm'>
                {strings.features[feature.key].description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  )
}
