'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import image10 from '@/public/images/10.png'
import image2 from '@/public/images/2.png'
import image3 from '@/public/images/3.png'
import image5 from '@/public/images/5.png'
import image6 from '@/public/images/6.png'
import image7 from '@/public/images/7.png'
import rightBranch from '@/public/images/right-branch.png'
import { ArrowRight02Icon, FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from '../../_components/sparkle-dividier'

const PRODUCT_COLLECTIONS = [
  {
    id: 'womens-day',
    occasionKey: 'about.productLines.items.womensDay.occasion',
    nameKey: 'about.productLines.items.womensDay.name',
    descriptionKey: 'about.productLines.items.womensDay.description',
    image: image2,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-womens-day.png'
  },
  {
    id: 'vietnamese-womens-day',
    occasionKey: 'about.productLines.items.vietnameseWomensDay.occasion',
    nameKey: 'about.productLines.items.vietnameseWomensDay.name',
    descriptionKey: 'about.productLines.items.vietnameseWomensDay.description',
    image: image3,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-vietnamese-womens-day.png'
  },
  {
    id: 'teachers-day',
    occasionKey: 'about.productLines.items.teachersDay.occasion',
    nameKey: 'about.productLines.items.teachersDay.name',
    descriptionKey: 'about.productLines.items.teachersDay.description',
    image: image10,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-teachers-day.png'
  },
  {
    id: 'seasonal-bouquet',
    occasionKey: 'about.productLines.items.seasonalBouquet.occasion',
    nameKey: 'about.productLines.items.seasonalBouquet.name',
    descriptionKey: 'about.productLines.items.seasonalBouquet.description',
    image: image5,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-seasonal.png'
  },
  {
    id: 'tet-orchid',
    occasionKey: 'about.productLines.items.tetOrchid.occasion',
    nameKey: 'about.productLines.items.tetOrchid.name',
    descriptionKey: 'about.productLines.items.tetOrchid.description',
    image: image6,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-tet.png'
  },
  {
    id: 'birthday-gift',
    occasionKey: 'about.productLines.items.birthdayGift.occasion',
    nameKey: 'about.productLines.items.birthdayGift.name',
    descriptionKey: 'about.productLines.items.birthdayGift.description',
    image: image7,
    accent: 'bg-pink-200/15',
    bg: '/images/about/bg-product-birthday.png'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.88, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 140, damping: 16 }
  }
}

export default function ProductLinesSection() {
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
            {t('about.productLines.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('about.productLines.description')}
        </p>
      </motion.div>

      <Image
        src={rightBranch}
        alt={t('about.productLines.branchAlt')}
        className='wind-wiggle-right absolute -right-8 bottom-12 h-52 w-auto opacity-25 hidden lg:block pointer-events-none'
        aria-hidden='true'
      />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 lg:gap-5'
      >
        {PRODUCT_COLLECTIONS.map((line) => {
          const name = t(line.nameKey)

          return (
            <motion.article
              key={line.id}
              variants={cardItem}
              whileHover={{ y: -12, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className='group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:rounded-2xl lg:rounded-3xl'
            >
              <div
                className={`relative isolate flex h-44 items-center justify-center overflow-hidden sm:h-36 md:h-40 lg:h-44 ${line.accent}`}
              >
                {/* <DecorImage
                  src={line.bg}
                  sizes='(min-width: 640px) 33vw, 100vw'
                  quality={70}
                  className='-z-10 object-cover'
                /> */}
                {/* <motion.div
                  aria-hidden='true'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className='absolute inset-3 rounded-2xl border border-dashed border-primary/15 sm:inset-2 lg:inset-3'
                /> */}
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] }}
                  whileHover={{ scale: 1.15, rotate: -6 }}
                  transition={{
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                    scale: { type: 'spring', stiffness: 240, damping: 16 }
                  }}
                  className='flex items-center justify-center'
                >
                  <Image
                    src={line.image}
                    alt={name}
                    className='h-36 w-auto object-contain sm:h-28 md:h-32 lg:h-40'
                    loading='lazy'
                  />
                </motion.div>
                <motion.span
                  whileHover={{ scale: 1.12, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 14 }}
                  className='absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[0.625rem] font-medium text-primary backdrop-blur-sm ring-1 ring-foreground/5 sm:left-2 sm:top-2 sm:max-w-[calc(100%-1rem)] sm:text-[0.5625rem] md:text-[0.625rem] lg:left-3 lg:top-3 lg:max-w-[calc(100%-1.5rem)] lg:text-xs'
                >
                  <motion.span
                    animate={{ rotate: [0, 12, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className='inline-flex'
                  >
                    <HugeiconsIcon icon={FlowerIcon} className='size-3.5 shrink-0' />
                  </motion.span>
                  <span className='truncate'>{t(line.occasionKey)}</span>
                </motion.span>
              </div>

              <div className='flex flex-1 flex-col gap-1.5 p-4 sm:p-3 md:p-4 lg:p-5'>
                <h2 className='font-title text-lg font-bold leading-tight text-primary sm:text-base md:text-lg lg:text-xl'>
                  {name}
                </h2>
                <p className='flex-1 text-xs leading-relaxed text-foreground'>{t(line.descriptionKey)}</p>

                <motion.button
                  type='button'
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                  className='mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-foreground'
                >
                  {t('about.productLines.explore')}
                  <motion.span
                    className='inline-flex'
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <HugeiconsIcon icon={ArrowRight02Icon} className='size-3' />
                  </motion.span>
                </motion.button>
              </div>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}
