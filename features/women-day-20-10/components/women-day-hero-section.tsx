'use client'

import { Button } from '@/components/ui/button'
import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import vietnameseWomensDay from '@/public/images/about/bg-product-vietnamese-womens-day.png'
import flower from '@/public/images/about-avatar.png'
import { Calendar03Icon, GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import Image from 'next/image'

export default function WomenDayHeroSection() {
  const { t } = useTranslation()

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={stagger}
      className='relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-secondary/35 shadow-[0_1rem_3rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:mx-6 sm:mt-6 lg:mx-auto lg:max-w-7xl'
    >
      <Image
        src={vietnameseWomensDay}
        alt=''
        fill
        priority
        quality={65}
        sizes='(min-width: 1280px) 1280px, 100vw'
        className='pointer-events-none -z-10 object-cover opacity-75'
      />
      <div className='absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/75 to-background/15' />

      <div className='grid min-h-[38rem] items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16'>
        <motion.div variants={stagger} className='max-w-xl space-y-5'>
          <motion.p variants={fadeUp} className='font-title text-sm font-bold tracking-[0.18em] text-primary uppercase'>
            {t('womenDay.hero.eyebrow')}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className='font-title text-4xl leading-[1.08] font-bold text-primary sm:text-5xl lg:text-6xl'
          >
            {t('womenDay.hero.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className='max-w-lg text-sm leading-relaxed text-foreground sm:text-base'>
            {t('womenDay.hero.intro')}
          </motion.p>
          <motion.div variants={fadeUp} className='flex flex-wrap gap-3 pt-1'>
            <Button asChild size='lg' className='gap-2 shadow-[0_0.7rem_1.5rem_rgb(81_108_108/22%)]'>
              <Link href='#collection'>
                <HugeiconsIcon icon={GiftIcon} className='size-4' />
                {t('womenDay.hero.primary')}
              </Link>
            </Button>
            <Button asChild size='lg' variant='outline' className='bg-card/75 text-primary backdrop-blur-sm'>
              <Link href='#guide'>{t('womenDay.hero.secondary')}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className='relative mx-auto flex w-full max-w-md justify-center lg:max-w-none'>
          <div
            aria-hidden='true'
            className='absolute inset-0 m-auto size-64 rounded-full bg-primary/15 blur-3xl sm:size-80'
          />
          <div className='bob-tilt-lg relative size-64 overflow-hidden rounded-full bg-card/80 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] ring-8 ring-card/60 sm:size-80'>
            <div
              aria-hidden='true'
              className='spin-loop absolute inset-3 z-10 rounded-full border border-dashed border-primary/20'
            />
            <div className='sway-soft absolute inset-0'>
              <Image src={flower} alt='' fill sizes='20rem' className='object-cover object-center' />
            </div>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.55 }}
            whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
            whileTap={{ scale: 0.96 }}
            className='absolute -top-1 right-2 hidden rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 sm:block'
          >
            <span className='block font-title text-base leading-none font-bold text-primary'>12</span>
            <span className='block text-[0.5rem] font-semibold tracking-widest text-muted-foreground uppercase'>
              {t('womenDay.hero.seasonsLabel')}
            </span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.3, rotate: 45 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.75 }}
            whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
            whileTap={{ scale: 0.96 }}
            className='absolute top-1/2 -left-2 hidden -translate-y-1/2 rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 lg:block'
          >
            <span className='block font-title text-sm leading-none font-bold text-leaf'>100%</span>
            <span className='block text-[0.5rem] font-semibold tracking-widest text-muted-foreground uppercase'>
              {t('womenDay.hero.naturalLabel')}
            </span>
          </motion.span>
          <motion.span
            whileHover={{ y: -4, scale: 1.12 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            className='absolute top-14 right-1 rounded-full bg-primary px-3 py-1.5 font-title text-xs font-bold text-primary-foreground shadow-md sm:top-16 sm:right-5'
          >
            {t('womenDay.hero.dateMark')}
          </motion.span>
          <motion.span
            whileHover={{ y: -4, scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            className='absolute bottom-2 left-2 rounded-2xl bg-card/90 px-3 py-2 text-center shadow-md ring-1 ring-foreground/5 backdrop-blur-sm sm:left-0'
          >
            <span className='block font-title text-lg font-bold text-primary'>{t('womenDay.hero.brandLine')}</span>
            <span className='block text-[0.6rem] font-semibold tracking-widest text-muted-foreground uppercase'>
              {t('womenDay.hero.brandLabel')}
            </span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.45 }}
            whileHover={{ y: -4, scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className='absolute -bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[0.625rem] font-semibold text-primary-foreground shadow-md sm:bottom-0'
          >
            <HugeiconsIcon icon={Calendar03Icon} className='size-3.5' />
            {t('womenDay.hero.founded')}
          </motion.span>
        </motion.div>
      </div>
    </motion.section>
  )
}
