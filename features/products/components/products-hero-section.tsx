'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import flower from '@/public/images/flower.png'
import {
  Building02Icon,
  CherryIcon,
  DeliveryTruck01Icon,
  Flower2Icon,
  GiftIcon,
  ShoppingBag01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'

const HIGHLIGHTS = [
  { icon: Flower2Icon, labelKey: 'products.hero.highlights.seasons' },
  { icon: DeliveryTruck01Icon, labelKey: 'products.hero.highlights.fastDelivery' },
  { icon: CherryIcon, labelKey: 'products.hero.highlights.fresh' }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const flowerCircle: Variants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 130, damping: 16, mass: 0.9 }
  }
}

const chipPop: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 14 } }
}

export default function ProductsHeroSection() {
  const { t } = useTranslation()

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative px-4 pt-4 sm:pt-6 md:pt-8 lg:pt-10'
    >
      <motion.div
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
            {t('products.hero.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('products.hero.description')}
        </p>
      </motion.div>

      <div className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-5 sm:gap-6 lg:mt-10 lg:grid-cols-12 lg:items-center lg:gap-10'>
        <motion.div variants={containerStagger} className='space-y-4 lg:col-span-7'>
          <motion.div variants={fadeUp} className='flex flex-wrap gap-2'>
            {HIGHLIGHTS.map((item) => (
              <motion.span
                key={item.labelKey}
                variants={chipPop}
                whileHover={{ y: -3, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                className='inline-flex'
              >
                <Badge
                  variant='secondary'
                  className='gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary shadow-[0_0.45rem_1.2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
                >
                  <HugeiconsIcon icon={item.icon} className='size-3.5' />
                  {t(item.labelKey)}
                </Badge>
              </motion.span>
            ))}
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className='font-title text-2xl font-bold leading-tight text-primary sm:text-3xl lg:text-4xl'
          >
            {t('products.hero.headline')}
          </motion.h2>

          <motion.p variants={fadeUp} className='text-xs leading-relaxed text-foreground sm:text-sm'>
            {t('products.hero.body')}
          </motion.p>

          <motion.div variants={fadeUp} className='flex flex-wrap items-center gap-3'>
            <motion.div
              whileHover={{ y: -5, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='group relative'
            >
              <motion.span
                aria-hidden='true'
                animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className='pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-primary/35 blur-xl'
              />
              <Button
                asChild
                size='lg'
                className='relative gap-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/22%)] ring-1 ring-primary/20 transition-shadow hover:shadow-[0_1rem_2.4rem_rgb(81_108_108/32%)]'
              >
                <Link href='/about#product-lines'>
                  <HugeiconsIcon
                    icon={ShoppingBag01Icon}
                    className='size-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125'
                  />
                  {t('products.hero.shopByType')}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='group'
            >
              <Button
                asChild
                size='lg'
                variant='outline'
                className='gap-2 bg-card text-primary shadow-[0_0.45rem_1.2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 transition-all hover:bg-secondary/60 hover:shadow-[0_0.9rem_2.2rem_rgb(81_108_108/20%)]'
              >
                <Link href='/products#occasion'>
                  <HugeiconsIcon
                    icon={GiftIcon}
                    className='size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125'
                  />
                  {t('products.hero.shopByOccasion')}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='group'
            >
              <Button
                asChild
                size='lg'
                variant='outline'
                className='gap-2 bg-card text-primary shadow-[0_0.45rem_1.2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 transition-all hover:bg-secondary/60 hover:shadow-[0_0.9rem_2.2rem_rgb(81_108_108/20%)]'
              >
                <Link href='/b2b'>
                  <HugeiconsIcon
                    icon={Building02Icon}
                    className='size-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125'
                  />
                  Đặt hoa cho doanh nghiệp
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={flowerCircle} className='relative flex items-center justify-center lg:col-span-5'>
          <div
            aria-hidden='true'
            className='absolute inset-0 m-auto h-48 w-48 rounded-full bg-secondary/40 blur-3xl sm:h-60 sm:w-60 lg:h-72 lg:w-72'
          />

          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className='relative grid size-56 place-items-center rounded-full bg-card shadow-[0_1.2rem_3rem_rgb(81_108_108/14%)] ring-1 ring-foreground/5 sm:size-68 lg:size-80'
          >
            <motion.div
              aria-hidden='true'
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className='absolute inset-2 rounded-full border border-dashed border-primary/15 sm:inset-3'
            />

            <motion.div
              animate={{ rotate: [0, -2, 0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={flower}
                alt={t('products.hero.imageAlt')}
                className='h-48 w-auto object-contain sm:h-60 lg:h-68'
                sizes='(min-width: 1024px) 17rem, (min-width: 640px) 15rem, 12rem'
                priority
                fetchPriority='high'
                quality={75}
              />
            </motion.div>

            <motion.div
              whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className='absolute -top-2 right-2 hidden rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 sm:block'
              style={{ rotate: '6deg' }}
            >
              <p className='font-title text-base font-bold text-primary leading-none'>50+</p>
              <p className='text-[0.5rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t('products.hero.designsLabel')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className='absolute top-1/2 -left-3 hidden -translate-y-1/2 rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 lg:block'
              style={{ rotate: '-6deg' }}
            >
              <p className='font-title text-sm font-bold text-leaf leading-none'>2H</p>
              <p className='text-[0.5rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t('products.hero.fastDeliveryLabel')}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
