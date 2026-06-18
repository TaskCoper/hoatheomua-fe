'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import flowerImage from '@/public/images/flower.png'
import { ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from './sparkle-dividier'

const SIGNATURE_FLOWERS = [
  'home.signatureBouquets.flowers.peony',
  'home.signatureBouquets.flowers.phalaenopsis',
  'home.signatureBouquets.flowers.calla',
  'home.signatureBouquets.flowers.lilyOfTheValley',
  'home.signatureBouquets.flowers.birdOfParadise',
  'home.signatureBouquets.flowers.hyacinth',
  'home.signatureBouquets.flowers.tulip',
  'home.signatureBouquets.flowers.gardenRose',
  'home.signatureBouquets.flowers.anemone'
] as const

const SIGNATURE_BOUQUETS = [
  { id: 1, nameKey: 'home.signatureBouquets.bouquets.classicRose', imageClassName: 'scale-105 rotate-[-6deg]' },
  { id: 2, nameKey: 'home.signatureBouquets.bouquets.pinkRose', imageClassName: 'scale-110 rotate-[8deg]' },
  { id: 3, nameKey: 'home.signatureBouquets.bouquets.peachBloom', imageClassName: 'scale-95 rotate-[2deg]' },
  { id: 4, nameKey: 'home.signatureBouquets.bouquets.sweetBerry', imageClassName: 'scale-100 rotate-[-2deg]' },
  { id: 5, nameKey: 'home.signatureBouquets.bouquets.pastelRose', imageClassName: 'scale-105 rotate-[5deg]' },
  { id: 6, nameKey: 'home.signatureBouquets.bouquets.wildflower', imageClassName: 'scale-100 rotate-[-8deg]' }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const listStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
}

const listItem: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.88, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 150, damping: 16 }
  }
}

export default function SignatureBouquetsSection() {
  const { t } = useTranslation()

  return (
    <>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='my-4 sm:my-6 md:my-8 lg:my-10 space-y-2 overflow-hidden px-4'
      >
        <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
          <div className='flex items-center justify-start sm:justify-center gap-3'>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
              {t('home.signatureBouquets.title')}
            </h1>

            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
            {t('home.signatureBouquets.description')}
          </p>
        </div>
      </motion.div>

      <section className='relative left-1/2 -translate-x-1/2 bg-background'>
        <div className='mx-auto grid w-full max-w-7xl gap-4 px-4 lg:grid-cols-12'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={listStagger}
            className='flex flex-col gap-2 items-center lg:items-start text-sm text-muted-foreground lg:col-span-5'
          >
            {SIGNATURE_FLOWERS.map((flowerKey, index) => {
              const isActive = index === 2

              return (
                <motion.button
                  key={flowerKey}
                  variants={listItem}
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  type='button'
                  className={[
                    'block w-full sm:w-fit rounded-xl px-3 py-2 text-center lg:text-left text-xs sm:text-sm transition-colors',
                    isActive
                      ? 'bg-card font-bold text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)]'
                      : 'hover:text-primary'
                  ].join(' ')}
                >
                  {t(flowerKey)}
                </motion.button>
              )
            })}
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className='grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-2 lg:col-span-7 xl:grid-cols-3'
          >
            {SIGNATURE_BOUQUETS.map((bouquet, index) => {
              const isActive = index === 0
              const bouquetName = t(bouquet.nameKey)

              return (
                <motion.article
                  key={bouquet.id}
                  variants={cardItem}
                  whileHover={{ y: -12, scale: 1.035 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                  className={['group relative h-60', isActive ? 'rounded-[1.75rem]' : ''].join(' ')}
                >
                  {isActive ? (
                    <div
                      aria-hidden='true'
                      className='pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[1.9rem] border border-primary'
                    />
                  ) : null}

                  <div
                    className={[
                      'relative z-10 flex h-full flex-col justify-between rounded-[1.75rem] bg-card p-4 shadow-[0_0.8rem_2rem_rgb(81_108_108_/_7%)]',
                      isActive ? 'rounded-[1.75rem] bg-white shadow-[0_1rem_2.5rem_rgb(81_108_108_/_16%)]' : ''
                    ].join(' ')}
                  >
                    <div className='flex flex-1 items-center justify-center'>
                      <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] }}
                        whileHover={{ scale: 1.12, rotate: -6 }}
                        transition={{
                          y: { duration: 3.5 + (index % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' },
                          rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                          scale: { type: 'spring', stiffness: 240, damping: 16 }
                        }}
                        className='flex items-center justify-center'
                      >
                        <Image
                          src={flowerImage}
                          alt={bouquetName}
                          className={`h-32 w-auto object-contain ${bouquet.imageClassName}`}
                          sizes='8rem'
                          loading='lazy'
                          quality={70}
                        />
                      </motion.div>
                    </div>

                    <div className='flex items-end justify-between gap-4'>
                      <div className='min-w-0'>
                        <h2 className='truncate text-base font-bold leading-tight text-foreground'>{bouquetName}</h2>
                        <p className='text-xs font-medium text-foreground'>{t('home.signatureBouquets.price')}</p>
                      </div>

                      <motion.button
                        type='button'
                        whileHover={{ scale: 1.15, rotate: -12 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                        className='grid size-8 shrink-0 place-items-center rounded-full border border-foreground bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
                        aria-label={t('home.signatureBouquets.addToCart', { name: bouquetName })}
                      >
                        <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </section>
    </>
  )
}
