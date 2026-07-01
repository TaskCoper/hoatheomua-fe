'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import flower from '@/public/images/flower.png'
import { ArrowRight02Icon, Award04Icon, Leaf01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const photoEnter: Variants = {
  hidden: { opacity: 0, y: 50, rotate: -3, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: -1.5,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }
  }
}

const medallionEnter: Variants = {
  hidden: { opacity: 0, scale: 0.5, x: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 180, damping: 18, delay: 0.45 }
  }
}

const sealEnter: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 8,
    transition: { type: 'spring', stiffness: 220, damping: 16, delay: 0.6 }
  }
}

const leafEnter: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -22,
    transition: { type: 'spring', stiffness: 200, damping: 18, delay: 0.55 }
  }
}

export default function B2BHeroSection() {
  const { t } = useTranslation()
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const heroImageSrc = '/images/b2b/case-studies/indigo/03-orchid-vase.jpg'

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative isolate overflow-hidden px-4 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-20'
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-[radial-gradient(circle_at_25%_0%,rgb(188_208_199/45%),transparent_55%),radial-gradient(circle_at_85%_15%,rgb(245_220_220/35%),transparent_50%)]'
      />

      <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-16 -right-16 -z-10 size-[28rem] opacity-[0.07]'
        style={{
          backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '14rem'
        }}
      />

      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14'>
        <motion.div variants={containerStagger} className='space-y-5 lg:col-span-7'>
          <motion.div variants={fadeUp}>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3.5 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-primary ring-1 ring-primary/15 shadow-[0_0.25rem_0.75rem_rgb(81_108_108/8%)] sm:text-xs'>
              <HugeiconsIcon icon={SparklesIcon} className='size-3.5' />
              {t('b2b.hero.eyebrow')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className='font-title text-[2.25rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-[3.5rem]'
          >
            {t('b2b.hero.title')}
          </motion.h1>

          <motion.div variants={fadeUp} className='flex items-center gap-3'>
            <svg viewBox='0 0 80 6' className='h-1.5 w-16 text-primary/40 sm:w-20' fill='none' aria-hidden='true'>
              <path d='M0 3 Q 20 0, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
            <HugeiconsIcon icon={Leaf01Icon} className='size-4 text-leaf/80' />
            <svg viewBox='0 0 80 6' className='h-1.5 w-16 text-primary/40 sm:w-20' fill='none' aria-hidden='true'>
              <path d='M0 3 Q 20 6, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
          </motion.div>

          <motion.p variants={fadeUp} className='max-w-xl text-sm leading-relaxed text-foreground sm:text-base'>
            {t('b2b.hero.subtitle')}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className='flex max-w-xl items-start gap-2 text-xs leading-relaxed italic text-muted-foreground sm:text-sm'
          >
            <span aria-hidden='true' className='mt-2 inline-block h-px w-2 shrink-0 bg-leaf/60 sm:mt-2.5 sm:w-3' />
            <span>{t('b2b.hero.audienceLine')}</span>
          </motion.p>

          <motion.div variants={fadeUp} className='flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center'>
            <Button asChild size='lg' className='group w-full shadow-[0_0.5rem_1.5rem_rgb(81_108_108/22%)] sm:w-auto'>
              <Link href='/contact'>
                {t('b2b.hero.primaryCta')}
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className='transition-transform duration-300 group-hover:translate-x-1'
                />
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='ghost'
              className='w-full text-primary hover:bg-primary/5 hover:text-primary sm:w-auto'
            >
              <Link href='/contact'>{t('b2b.hero.secondaryCta')}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className='relative mx-auto flex h-[28rem] w-full max-w-md items-center justify-center sm:h-[32rem] lg:col-span-5 lg:h-[36rem]'
        >
          <div
            aria-hidden='true'
            className='absolute inset-0 m-auto h-72 w-72 rounded-full bg-secondary/55 blur-3xl sm:h-96 sm:w-96'
          />

          <motion.div
            aria-hidden='true'
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
            className='absolute inset-0 m-auto h-[20rem] w-[20rem] rounded-full border border-dashed border-primary/15 sm:h-[24rem] sm:w-[24rem] lg:h-[28rem] lg:w-[28rem]'
          />

          <motion.button
            type='button'
            variants={photoEnter}
            whileHover={{ rotate: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={() => setIsLightboxOpen(true)}
            aria-label={t('b2b.hero.imageAlt')}
            className='relative h-[22rem] w-[16rem] overflow-hidden rounded-[2rem] bg-card shadow-[0_2rem_4rem_rgb(81_108_108/22%)] ring-1 ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-[26rem] sm:w-[18.5rem] lg:h-[30rem] lg:w-[21rem]'
          >
            <Image
              src={heroImageSrc}
              alt={t('b2b.hero.imageAlt')}
              fill
              className='object-cover'
              sizes='(min-width: 1024px) 21rem, (min-width: 640px) 18rem, 16rem'
              priority
              fetchPriority='high'
              quality={80}
            />

            <span
              aria-hidden='true'
              className='absolute inset-0 bg-gradient-to-t from-primary/35 via-primary/0 to-primary/0'
            />

            <span aria-hidden='true' className='absolute inset-3 rounded-[1.5rem] ring-1 ring-card/40' />
          </motion.button>

          <motion.div
            variants={medallionEnter}
            whileHover={{
              rotate: 8,
              scale: 1.05,
              transition: { type: 'spring', stiffness: 240, damping: 18 }
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            className='absolute -left-2 bottom-4 grid size-28 place-items-center rounded-full bg-card shadow-[0_1rem_2.5rem_rgb(81_108_108/22%)] ring-1 ring-foreground/5 sm:-left-4 sm:bottom-10 sm:size-32 lg:-left-6 lg:size-36'
            // medallion stays present alongside the photo to keep the brand mark
          >
            <span aria-hidden='true' className='absolute inset-2 rounded-full border border-dashed border-primary/25' />
            <Image
              src={flower}
              alt=''
              className='h-16 w-auto object-contain sm:h-20 lg:h-24'
              sizes='8rem'
              quality={70}
            />
          </motion.div>

          <motion.svg
            variants={leafEnter}
            viewBox='0 0 24 36'
            className='absolute -top-2 right-2 size-14 text-leaf/55 drop-shadow-[0_0.3rem_0.6rem_rgb(122_156_89/24%)] sm:right-4 sm:size-20 lg:-top-4 lg:right-0 lg:size-24'
            fill='currentColor'
            aria-hidden='true'
          >
            <path d='M12 1 C 4 7, 2 20, 12 35 C 22 20, 20 7, 12 1 Z' />
            <path d='M12 3 L 12 33' stroke='var(--color-background)' strokeWidth='0.4' fill='none' opacity='0.7' />
          </motion.svg>

          <motion.svg
            variants={leafEnter}
            viewBox='0 0 24 36'
            className='absolute top-12 -left-3 size-10 text-secondary drop-shadow-[0_0.3rem_0.6rem_rgb(81_108_108/16%)] sm:size-14 lg:size-16'
            fill='currentColor'
            style={{ transform: 'rotate(160deg)' }}
            aria-hidden='true'
          >
            <path d='M12 1 C 4 7, 2 20, 12 35 C 22 20, 20 7, 12 1 Z' />
            <path d='M12 3 L 12 33' stroke='var(--color-card)' strokeWidth='0.4' fill='none' opacity='0.7' />
          </motion.svg>

          <motion.div
            variants={sealEnter}
            whileHover={{ rotate: 0, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            className='absolute -top-3 -right-1 grid size-20 place-items-center rounded-full bg-card text-primary shadow-[0_0.8rem_2rem_rgb(81_108_108/22%)] ring-1 ring-primary/10 sm:size-24 lg:-top-2 lg:right-4'
          >
            <span
              aria-hidden='true'
              className='absolute inset-1.5 rounded-full border border-dashed border-primary/25'
            />
            <HugeiconsIcon icon={Award04Icon} className='size-8 text-leaf sm:size-9' />
          </motion.div>
        </motion.div>
      </div>

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[{ src: heroImageSrc, alt: t('b2b.hero.imageAlt') }]}
        plugins={[Fullscreen, Zoom]}
        carousel={{ finite: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      />
    </motion.section>
  )
}
