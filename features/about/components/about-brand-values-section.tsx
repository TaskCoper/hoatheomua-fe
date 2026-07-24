'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import cornerFlowersLeft from '@/public/images/DownLeftCorner-removebg-preview.png'
import cornerFlowersRight from '@/public/images/DownRightCorner-removebg-preview.png'
import leftBranch from '@/public/images/left-branch.png'
import valueImage from '@/public/images/value.png'
import {
  Diamond01Icon,
  Flag03Icon,
  HandHeartIcon,
  HappyIcon,
  Leaf01Icon,
  SparklesIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'

const BRAND_VALUES = [
  {
    number: '01',
    icon: Flag03Icon,
    titleKey: 'about.values.items.vietnamese.title',
    descriptionKey: 'about.values.items.vietnamese.description'
  },
  {
    number: '02',
    icon: HappyIcon,
    titleKey: 'about.values.items.enjoy.title',
    descriptionKey: 'about.values.items.enjoy.description'
  },
  {
    number: '03',
    icon: Diamond01Icon,
    titleKey: 'about.values.items.simple.title',
    descriptionKey: 'about.values.items.simple.description'
  },
  {
    number: '04',
    icon: SparklesIcon,
    titleKey: 'about.values.items.elegant.title',
    descriptionKey: 'about.values.items.elegant.description'
  },
  {
    number: '05',
    icon: Leaf01Icon,
    titleKey: 'about.values.items.eco.title',
    descriptionKey: 'about.values.items.eco.description'
  },
  {
    number: '06',
    icon: HandHeartIcon,
    titleKey: 'about.values.items.emotion.title',
    descriptionKey: 'about.values.items.emotion.description'
  }
] as const

const [featuredValue, ...restValues] = BRAND_VALUES

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -44, scale: 0.94 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 16 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

export default function BrandValuesSection() {
  const { t } = useTranslation()

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
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

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('about.values.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('about.values.description')}
        </p>
      </motion.div>

      <Image
        src={leftBranch}
        alt={t('about.values.branchAlt')}
        className='wind-wiggle-left absolute -left-8 top-0 h-56 w-auto opacity-30 hidden lg:block pointer-events-none'
        aria-hidden='true'
      />

      <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5'>
        <motion.article
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={slideInLeft}
          whileHover={{ y: -8, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className='group relative flex h-full min-h-[28rem] self-stretch flex-col overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-[0_0.8rem_2rem_rgb(81_108_108/16%)] lg:col-span-5'
        >
          <Image
            src={valueImage}
            alt={t(featuredValue.titleKey)}
            fill
            sizes='(min-width: 1024px) 40vw, 100vw'
            priority
            className='object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105'
          />

          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 bg-linear-to-t from-primary via-primary/85 via-30% to-primary/10'
          />

          {/* <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay'
            style={{
              backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '16rem'
            }}
          /> */}

          <motion.span
            aria-hidden='true'
            animate={{ rotate: [0, 12, 0, -4, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className='pointer-events-none absolute -right-8 -bottom-10 font-title text-[10rem] font-bold leading-none text-primary-foreground/10 sm:-right-10 sm:-bottom-12 sm:text-[13rem]'
          >
            {featuredValue.number}
          </motion.span>

          <div className='relative z-10 flex h-full flex-col justify-between gap-6 p-5 sm:p-6'>
            <div className='flex items-start justify-between'>
              <motion.div
                whileHover={{ rotate: -16, scale: 1.18 }}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  rotate: { type: 'spring', stiffness: 380, damping: 12 },
                  scale: { type: 'spring', stiffness: 380, damping: 12 },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className='grid size-11 place-items-center rounded-xl bg-primary-foreground/20 text-primary-foreground shadow-lg backdrop-blur-md ring-1 ring-primary-foreground/30 sm:size-12'
              >
                <HugeiconsIcon icon={featuredValue.icon} className='size-5 sm:size-6' />
              </motion.div>
              <span className='rounded-full bg-primary-foreground/15 px-3 py-1 font-title text-xs font-bold tracking-widest text-primary-foreground backdrop-blur ring-1 ring-primary-foreground/20 sm:text-sm'>
                {featuredValue.number}
              </span>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='h-px w-3 bg-primary-foreground/60' aria-hidden='true' />
                <p className='text-[0.625rem] text-primary-foreground font-bold uppercase tracking-[0.2em]'>
                  {t('about.values.coreLabel')}
                </p>
              </div>
              <h2 className='font-title text-2xl text-primary-foreground font-bold leading-tight drop-shadow-sm sm:text-3xl lg:text-4xl'>
                {t(featuredValue.titleKey)}
              </h2>
              <p className='text-xs leading-relaxed text-primary-foreground/95 sm:text-sm'>
                {t(featuredValue.descriptionKey)}
              </p>
            </div>
          </div>
        </motion.article>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={cardStagger}
          className='grid h-full self-stretch grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7 lg:grid-rows-3'
        >
          {restValues.map((value, index) => {
            const isWide = index === restValues.length - 1
            return (
              <motion.article
                key={value.number}
                variants={cardItem}
                whileHover={{ y: -8, scale: 1.025 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className={`group relative flex flex-col gap-2 overflow-hidden rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_0.9rem_2.2rem_rgb(81_108_108/14%)] sm:p-5 ${
                  isWide ? 'sm:col-span-2 sm:flex-row sm:items-start sm:gap-4' : ''
                }`}
              >
                {isWide && (
                  <>
                    <motion.div
                      animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }}
                      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                      className='pointer-events-none absolute -bottom-3 -left-3 z-0 sm:-bottom-4 sm:-left-4'
                    >
                      <Image
                        src={cornerFlowersLeft}
                        alt=''
                        aria-hidden='true'
                        className='h-28 w-auto select-none opacity-80 sm:h-32 lg:h-36'
                      />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -3, 0], rotate: [0, -2, 0] }}
                      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                      className='pointer-events-none absolute -bottom-2 -right-2 z-0 sm:-bottom-3 sm:-right-3'
                    >
                      <Image
                        src={cornerFlowersRight}
                        alt=''
                        aria-hidden='true'
                        className='h-28 w-auto select-none opacity-80 sm:h-32 lg:h-36'
                      />
                    </motion.div>
                  </>
                )}

                <motion.span
                  aria-hidden='true'
                  whileHover={{ scale: 1.15, rotate: 4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  className='pointer-events-none absolute right-2 -top-1 z-10 font-title text-5xl font-bold leading-none text-secondary/40 transition-colors group-hover:text-secondary/70 sm:right-2 sm:-top-2 sm:text-6xl'
                >
                  {value.number}
                </motion.span>

                <motion.div
                  whileHover={{ rotate: -14, scale: 1.18 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                  className='relative z-10 grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/70 text-primary shadow-sm ring-1 ring-primary/10'
                >
                  <HugeiconsIcon icon={value.icon} className='size-5' />
                </motion.div>

                <div className={`relative z-10 flex-1 space-y-1 ${isWide ? 'sm:pr-24 lg:pr-28' : ''}`}>
                  <h2 className='font-title text-base font-bold leading-tight text-primary lg:text-lg'>
                    {t(value.titleKey)}
                  </h2>
                  <p className='text-xs leading-relaxed text-foreground'>{t(value.descriptionKey)}</p>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
