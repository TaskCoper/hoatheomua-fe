'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import flower from '@/public/images/flower.png'
import { ArrowRight02Icon, Award04Icon, Building03Icon, HeadsetIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const STAT_KEYS = [
  { id: 'clients', valueKey: 'b2b.hero.stats.clients.value', labelKey: 'b2b.hero.stats.clients.label' },
  { id: 'hotels', valueKey: 'b2b.hero.stats.hotels.value', labelKey: 'b2b.hero.stats.hotels.label' },
  { id: 'events', valueKey: 'b2b.hero.stats.events.value', labelKey: 'b2b.hero.stats.events.label' },
  { id: 'cities', valueKey: 'b2b.hero.stats.cities.value', labelKey: 'b2b.hero.stats.cities.label' }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const floatBadgeRight: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 4,
    transition: { type: 'spring', stiffness: 240, damping: 14, delay: 0.5 }
  }
}

const floatBadgeLeft: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -4,
    transition: { type: 'spring', stiffness: 240, damping: 14, delay: 0.7 }
  }
}

export default function B2BHeroSection() {
  const { t } = useTranslation()

  return (
    <motion.section
      initial='hidden'
      animate='visible'
      variants={containerStagger}
      className='relative isolate px-4 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 lg:pb-10'
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%] bg-[radial-gradient(circle_at_30%_0%,rgb(188_208_199_/_38%),transparent_55%),radial-gradient(circle_at_85%_15%,rgb(245_220_220_/_30%),transparent_45%)]'
      />

      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10'>
        <motion.div variants={containerStagger} className='space-y-4 lg:col-span-7'>
          <motion.div variants={fadeUp}>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/15 sm:text-xs'>
              <HugeiconsIcon icon={SparklesIcon} className='size-3.5' />
              {t('b2b.hero.eyebrow')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className='font-title text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl'
          >
            {t('b2b.hero.title')}
          </motion.h1>

          <motion.p variants={fadeUp} className='max-w-xl text-sm leading-relaxed text-foreground sm:text-base'>
            {t('b2b.hero.subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className='flex flex-col gap-2.5 sm:flex-row sm:items-center'>
            <Button asChild size='lg' className='w-full sm:w-auto'>
              <Link href='/contact'>
                {t('b2b.hero.primaryCta')}
                <HugeiconsIcon icon={ArrowRight02Icon} />
              </Link>
            </Button>
            <Button asChild size='lg' variant='outline' className='w-full border-primary/25 text-primary sm:w-auto'>
              <Link href='#b2b-packages'>{t('b2b.hero.secondaryCta')}</Link>
            </Button>
          </motion.div>

          <motion.dl
            variants={containerStagger}
            className='mt-3 grid grid-cols-2 gap-2.5 rounded-3xl bg-card/90 p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:grid-cols-4 sm:gap-3'
          >
            {STAT_KEYS.map((stat) => (
              <motion.div key={stat.id} variants={fadeUp} className='space-y-0.5 text-center sm:text-left'>
                <dt className='order-2 text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
                  {t(stat.labelKey)}
                </dt>
                <dd className='order-1 font-title text-xl font-bold leading-none text-primary sm:text-2xl'>
                  {t(stat.valueKey)}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div variants={fadeUp} className='relative flex items-center justify-center lg:col-span-5'>
          <div
            aria-hidden='true'
            className='absolute inset-0 m-auto h-56 w-56 rounded-full bg-secondary/45 blur-3xl sm:h-72 sm:w-72 lg:h-80 lg:w-80'
          />

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 1.6, 0, -1.6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className='relative grid size-60 place-items-center rounded-full bg-card shadow-[0_1.2rem_3rem_rgb(81_108_108/14%)] ring-1 ring-foreground/5 sm:size-72 lg:size-80'
          >
            <motion.div
              aria-hidden='true'
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className='absolute inset-3 rounded-full border border-dashed border-primary/15'
            />

            <motion.div
              animate={{ rotate: [0, -2.5, 0, 2.5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={flower}
                alt={t('b2b.hero.imageAlt')}
                className='h-48 w-auto object-contain sm:h-60 lg:h-64'
                sizes='(min-width: 1024px) 16rem, (min-width: 640px) 15rem, 12rem'
                priority
                fetchPriority='high'
                quality={75}
              />
            </motion.div>

            <motion.div
              variants={floatBadgeRight}
              whileHover={{ rotate: 0, scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className='absolute -top-1 -right-2 flex items-center gap-1.5 rounded-2xl bg-card px-2.5 py-1.5 shadow-md ring-1 ring-foreground/5 sm:-top-2 sm:-right-3'
            >
              <span className='grid size-7 place-items-center rounded-xl bg-primary text-primary-foreground'>
                <HugeiconsIcon icon={Building03Icon} className='size-3.5' />
              </span>
              <div className='-space-y-0.5 pr-1'>
                <p className='font-title text-[0.625rem] font-bold leading-none text-primary sm:text-xs'>
                  {t('b2b.hero.stats.clients.value')}
                </p>
                <p className='text-[0.5rem] font-medium uppercase tracking-widest text-muted-foreground'>
                  {t('b2b.hero.stats.clients.label')}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={floatBadgeLeft}
              whileHover={{ rotate: 0, scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className='absolute top-1/2 -left-3 hidden -translate-y-1/2 items-center gap-1.5 rounded-2xl bg-card px-2.5 py-1.5 shadow-md ring-1 ring-foreground/5 sm:-left-6 sm:flex'
            >
              <span className='grid size-7 place-items-center rounded-xl bg-leaf/15 text-leaf'>
                <HugeiconsIcon icon={Award04Icon} className='size-3.5' />
              </span>
              <div className='-space-y-0.5 pr-1'>
                <p className='font-title text-[0.625rem] font-bold leading-none text-primary sm:text-xs'>
                  {t('b2b.hero.stats.hotels.value')}
                </p>
                <p className='text-[0.5rem] font-medium uppercase tracking-widest text-muted-foreground'>
                  {t('b2b.hero.stats.hotels.label')}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={floatBadgeRight}
              whileHover={{ rotate: 0, scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className='absolute -bottom-2 right-3 flex items-center gap-1.5 rounded-2xl bg-card px-2.5 py-1.5 shadow-md ring-1 ring-foreground/5 sm:-bottom-3 sm:right-4'
            >
              <span className='grid size-7 place-items-center rounded-xl bg-secondary text-primary'>
                <HugeiconsIcon icon={HeadsetIcon} className='size-3.5' />
              </span>
              <div className='-space-y-0.5 pr-1'>
                <p className='font-title text-[0.625rem] font-bold leading-none text-primary sm:text-xs'>
                  {t('b2b.hero.stats.support.value')}
                </p>
                <p className='text-[0.5rem] font-medium uppercase tracking-widest text-muted-foreground'>
                  {t('b2b.hero.stats.support.label')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
