'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import flower from '@/public/images/flower.png'
import { Calendar03Icon, QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import DecorImage from './decor-image'

const STORY_PARAGRAPH_KEYS = ['about.hero.story1', 'about.hero.story2', 'about.hero.story3'] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
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

const badgePopRight: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotate: -45 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 6,
    transition: { type: 'spring', stiffness: 260, damping: 12, delay: 0.55 }
  }
}

const badgePopLeft: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotate: 45 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -6,
    transition: { type: 'spring', stiffness: 260, damping: 12, delay: 0.75 }
  }
}

const stampPop: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.6 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 14, delay: 0.45 }
  }
}

export default function AboutHeroSection() {
  const { t } = useTranslation()

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative isolate px-4 py-4 sm:py-6 md:py-8 lg:py -10'
    >
      <DecorImage
        src='/images/about/hero-hanoi-wash.png'
        priority
        quality={65}
        sizes='100vw'
        className='pointer-events-none -z-10 select-none object-cover object-top opacity-35'
      />

      <motion.div
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
          {t('about.hero.title')}
        </h1>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('about.hero.intro')} <span className='font-semibold text-primary'>{t('about.hero.ceoName')}</span>{' '}
          {t('about.hero.introAfter')}
        </p>
      </motion.div>

      <div className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-5 sm:gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-10 lg:items-center'>
        <motion.div variants={flowerCircle} className='relative flex items-center justify-center lg:col-span-5'>
          <div
            aria-hidden='true'
            className='absolute inset-0 m-auto h-48 w-48 rounded-full bg-secondary/40 blur-3xl sm:h-60 sm:w-60 lg:h-72 lg:w-72'
          />

          <div className='relative flex flex-col items-center'>
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
                  alt={t('about.hero.imageAlt')}
                  className='h-48 w-auto object-contain sm:h-60 lg:h-68'
                  sizes='(min-width: 1024px) 17rem, (min-width: 640px) 15rem, 12rem'
                  priority
                  fetchPriority='high'
                  quality={75}
                />
              </motion.div>

              <motion.div
                variants={badgePopRight}
                whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 12 }}
                className='absolute -top-2 right-2 hidden rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 sm:block'
              >
                <p className='font-title text-base font-bold text-primary leading-none'>12</p>
                <p className='text-[0.5rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('about.hero.twelveLabel')}
                </p>
              </motion.div>

              <motion.div
                variants={badgePopLeft}
                whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 12 }}
                className='absolute top-1/2 -left-3 hidden -translate-y-1/2 rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 lg:block'
              >
                <p className='font-title text-sm font-bold text-leaf leading-none'>100%</p>
                <p className='text-[0.5rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('about.hero.naturalLabel')}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={stampPop}
              whileHover={{ y: -4, scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='relative z-10 -mt-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground shadow-md'
            >
              <motion.span
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className='inline-flex'
              >
                <HugeiconsIcon icon={Calendar03Icon} className='size-3.5' />
              </motion.span>
              <span className='whitespace-nowrap text-[0.625rem] font-semibold leading-4 sm:text-xs'>
                {t('about.hero.founded')}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={containerStagger} className='space-y-3 lg:col-span-7'>
          <motion.h2
            variants={fadeUp}
            className='font-title text-xl font-bold leading-tight text-primary sm:text-2xl lg:text-3xl'
          >
            &ldquo;{t('about.hero.subtitle')}&rdquo;
          </motion.h2>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className='relative space-y-2 rounded-2xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-5'
          >
            <motion.div
              animate={{ rotate: [0, -12, 0, 8, 0], scale: [1, 1.1, 1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className='absolute -left-2 -top-2'
            >
              <HugeiconsIcon icon={QuoteUpIcon} className='size-7 text-secondary fill-secondary' aria-hidden='true' />
            </motion.div>

            {STORY_PARAGRAPH_KEYS.map((paragraphKey) => (
              <p key={paragraphKey} className='text-xs leading-relaxed text-foreground italic'>
                {t(paragraphKey)}
              </p>
            ))}

            <div className='flex items-center gap-2.5 border-t border-secondary/60 pt-2.5'>
              <motion.div
                whileHover={{ rotate: -12, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 320, damping: 12 }}
                className='relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-title text-sm font-bold text-primary-foreground'
              >
                LĐ
                <DecorImage
                  src='/images/about/founder-le-thi-hoa-dao.png'
                  alt={t('about.hero.founderAvatarAlt')}
                  sizes='2.25rem'
                  className='object-cover'
                />
              </motion.div>
              <div className='-space-y-0.5'>
                <p className='text-xs font-bold text-primary sm:text-sm'>{t('about.hero.founderName')}</p>
                <p className='text-[0.625rem] text-muted-foreground'>{t('about.hero.founderRole')}</p>
              </div>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className='text-xs leading-relaxed text-foreground'>
            {t('about.hero.closing')}
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  )
}
