'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { ArrowRight02Icon, Leaf01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
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
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }
  }
}

export default function B2BHeroSection() {
  const { t } = useTranslation()
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const heroImageSrc = '/images/b2b/case-studies/indigo/20.jpg'

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative isolate overflow-hidden px-4 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:min-h-[36rem] lg:pt-24 lg:pb-28'
    >
      <button
        type='button'
        onClick={() => setIsLightboxOpen(true)}
        aria-label={t('b2b.hero.imageAlt')}
        className='hidden lg:block absolute inset-0 -z-10 cursor-zoom-in focus-visible:outline-none'
      >
        <Image
          src={heroImageSrc}
          alt={t('b2b.hero.imageAlt')}
          fill
          className='object-cover object-center'
          priority
          fetchPriority='high'
          sizes='100vw'
          quality={80}
        />
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/15'
        />
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/40'
        />
      </button>

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-[radial-gradient(circle_at_25%_0%,rgb(188_208_199/45%),transparent_55%),radial-gradient(circle_at_85%_15%,rgb(245_220_220/35%),transparent_50%)] lg:hidden'
      />

      {/* <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-16 -right-16 -z-10 size-[28rem] opacity-[0.07] lg:hidden'
        style={{
          backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '14rem'
        }}
      /> */}

      <div className='relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14'>
        <motion.div variants={containerStagger} className='space-y-5 lg:col-span-8 lg:max-w-2xl'>
          <motion.div variants={fadeUp}>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3.5 py-1.5 text-[0.625rem] font-semibold tracking-wide text-primary ring-1 ring-primary/15 shadow-[0_0.25rem_0.75rem_rgb(81_108_108/8%)] sm:text-xs lg:bg-white/12 lg:text-white lg:ring-white/30 lg:shadow-none lg:backdrop-blur-sm'>
              <HugeiconsIcon icon={SparklesIcon} className='size-3.5' />
              {t('b2b.hero.eyebrow')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className='font-title text-[2.25rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-[3.5rem] lg:text-white lg:[text-shadow:0_0.15rem_0.6rem_rgb(0_0_0/25%)]'
          >
            {t('b2b.hero.title')}
          </motion.h1>

          <motion.div variants={fadeUp} className='flex items-center gap-3'>
            <svg
              viewBox='0 0 80 6'
              className='h-1.5 w-16 text-primary/40 sm:w-20 lg:text-white/50'
              fill='none'
              aria-hidden='true'
            >
              <path d='M0 3 Q 20 0, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
            <HugeiconsIcon icon={Leaf01Icon} className='size-4 text-leaf/80 lg:text-white/80' />
            <svg
              viewBox='0 0 80 6'
              className='h-1.5 w-16 text-primary/40 sm:w-20 lg:text-white/50'
              fill='none'
              aria-hidden='true'
            >
              <path d='M0 3 Q 20 6, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className='max-w-xl text-sm leading-relaxed text-foreground sm:text-base lg:text-white/90'
          >
            {t('b2b.hero.subtitle')}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className='flex max-w-xl items-start gap-2 text-xs leading-relaxed italic text-muted-foreground sm:text-sm lg:text-white/75'
          >
            <span
              aria-hidden='true'
              className='mt-2 inline-block h-px w-2 shrink-0 bg-leaf/60 sm:mt-2.5 sm:w-3 lg:bg-white/60'
            />
            <span>{t('b2b.hero.audienceLine')}</span>
          </motion.p>

          <motion.div variants={fadeUp} className='flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center'>
            <Button
              asChild
              size='lg'
              className='group w-full shadow-[0_0.5rem_1.5rem_rgb(81_108_108/22%)] sm:w-auto lg:bg-white lg:text-primary lg:hover:bg-white/90 lg:shadow-[0_0.6rem_1.8rem_rgb(0_0_0/25%)]'
            >
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
              className='w-full text-primary hover:bg-primary/5 hover:text-primary sm:w-auto lg:text-white lg:hover:bg-white/10 lg:hover:text-white'
            >
              <Link href='/contact'>{t('b2b.hero.secondaryCta')}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.button
          type='button'
          variants={photoEnter}
          onClick={() => setIsLightboxOpen(true)}
          aria-label={t('b2b.hero.imageAlt')}
          className='relative aspect-4/3 w-full overflow-hidden rounded-[2rem] bg-card shadow-[0_1.5rem_3rem_rgb(81_108_108/22%)] ring-1 ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden'
        >
          <Image
            src={heroImageSrc}
            alt={t('b2b.hero.imageAlt')}
            fill
            className='object-cover'
            priority
            fetchPriority='high'
            sizes='(min-width: 640px) 40rem, 100vw'
            quality={80}
          />
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-t from-primary/35 via-primary/0 to-primary/0'
          />
          <span aria-hidden='true' className='absolute inset-3 rounded-[1.5rem] ring-1 ring-card/40' />
        </motion.button>
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
