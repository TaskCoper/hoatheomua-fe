'use client'

import { Button } from '@/components/ui/button'
import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import vietnameseWomensDay from '@/public/images/about/bg-product-vietnamese-womens-day.png'
import flower from '@/public/images/about-avatar.png'
import { GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import Image from 'next/image'

export default function WomenDayHeroSection() {
  const { t } = useTranslation()

  return (
    <motion.section initial='hidden' animate='visible' variants={stagger} className='relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-secondary/35 shadow-[0_1rem_3rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:mx-6 sm:mt-6 lg:mx-auto lg:max-w-7xl'>
      <Image src={vietnameseWomensDay} alt='' fill priority quality={65} sizes='(min-width: 1280px) 1280px, 100vw' className='pointer-events-none -z-10 object-cover opacity-75' />
      <div className='absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/75 to-background/15' />
      <div className='grid min-h-[38rem] grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16'>
        <motion.div variants={stagger} className='min-w-0 max-w-xl space-y-5'>
          <motion.p variants={fadeUp} className='font-title text-sm font-bold tracking-[0.18em] text-primary uppercase'>{t('womenDay.hero.eyebrow')}</motion.p>
          <motion.h1 variants={fadeUp} className='font-title text-4xl leading-[1.08] font-bold text-primary sm:text-5xl lg:text-6xl'>{t('womenDay.hero.title')}</motion.h1>
          <motion.p variants={fadeUp} className='max-w-lg text-sm leading-relaxed text-foreground sm:text-base'>{t('womenDay.hero.intro')}</motion.p>
          <motion.div variants={fadeUp} className='flex flex-wrap gap-3 pt-1'><Button asChild size='lg' className='h-auto min-h-10 max-w-full gap-2 py-2 text-left whitespace-normal shadow-[0_0.7rem_1.5rem_rgb(81_108_108/22%)]'><Link href='#collection'><HugeiconsIcon icon={GiftIcon} className='size-4 shrink-0' />{t('womenDay.hero.primary')}</Link></Button></motion.div>
        </motion.div>
        <motion.div variants={fadeUp} className='relative mx-auto flex w-full max-w-md justify-center lg:max-w-none'>
          <div className='group relative size-64 overflow-hidden rounded-full bg-card/80 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] ring-8 ring-card/60 sm:size-80'><Image src={flower} alt='' fill sizes='20rem' className='object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105' /></div>
          <motion.span whileHover={{ rotate: 0, scale: 1.12, y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className='absolute -top-1 right-2 hidden max-w-32 rounded-xl bg-card px-2.5 py-1.5 text-center font-title text-xs leading-tight font-bold text-primary shadow-md ring-1 ring-foreground/5 sm:block'>{t('womenDay.hero.seasonsBadge')}</motion.span>
          <motion.span whileHover={{ rotate: 0, scale: 1.12, y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className='absolute top-1/2 -left-2 hidden max-w-24 -translate-y-1/2 rounded-xl bg-card px-2.5 py-1.5 text-center font-title text-xs leading-tight font-bold text-leaf shadow-md ring-1 ring-foreground/5 lg:block'>{t('womenDay.hero.naturalBadge')}</motion.span>
          <motion.span whileHover={{ y: -4, scale: 1.08 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }} className='absolute top-14 right-1 rounded-full bg-primary px-3 py-1.5 font-title text-xs font-bold text-primary-foreground shadow-md sm:top-16 sm:right-5'>{t('womenDay.hero.dateBadge')}</motion.span>
          <motion.span whileHover={{ y: -4, scale: 1.08 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }} className='absolute bottom-12 left-2 rounded-2xl bg-card/90 px-3 py-2 text-center font-title text-sm font-bold text-primary shadow-md ring-1 ring-foreground/5 backdrop-blur-sm sm:bottom-2 sm:left-0'>{t('womenDay.hero.deliveryBadge')}</motion.span>
          <motion.span whileHover={{ y: -4, scale: 1.08 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }} className='absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-center text-[0.625rem] font-semibold text-primary-foreground shadow-md'>{t('womenDay.hero.brandBadge')}</motion.span>
        </motion.div>
      </div>
    </motion.section>
  )
}
