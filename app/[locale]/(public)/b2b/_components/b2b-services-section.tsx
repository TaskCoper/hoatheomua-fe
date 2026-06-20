'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import {
  ArrowRight02Icon,
  Building03Icon,
  Calendar03Icon,
  GiftIcon,
  HeartCheckIcon,
  HotelIcon,
  SparklesIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { SparkleDivider } from '../../_components/sparkle-dividier'

const SERVICES = [
  {
    id: 'corporate-events',
    icon: Calendar03Icon,
    tagKey: 'b2b.services.items.corporateEvents.tag',
    nameKey: 'b2b.services.items.corporateEvents.name',
    descriptionKey: 'b2b.services.items.corporateEvents.description'
  },
  {
    id: 'office-subscription',
    icon: Building03Icon,
    tagKey: 'b2b.services.items.officeSubscription.tag',
    nameKey: 'b2b.services.items.officeSubscription.name',
    descriptionKey: 'b2b.services.items.officeSubscription.description'
  },
  {
    id: 'hospitality',
    icon: HotelIcon,
    tagKey: 'b2b.services.items.hospitality.tag',
    nameKey: 'b2b.services.items.hospitality.name',
    descriptionKey: 'b2b.services.items.hospitality.description'
  },
  {
    id: 'weddings',
    icon: HeartCheckIcon,
    tagKey: 'b2b.services.items.weddings.tag',
    nameKey: 'b2b.services.items.weddings.name',
    descriptionKey: 'b2b.services.items.weddings.description'
  },
  {
    id: 'gifting',
    icon: GiftIcon,
    tagKey: 'b2b.services.items.gifting.tag',
    nameKey: 'b2b.services.items.gifting.name',
    descriptionKey: 'b2b.services.items.gifting.description'
  },
  {
    id: 'grand-opening',
    icon: SparklesIcon,
    tagKey: 'b2b.services.items.grandOpening.tag',
    nameKey: 'b2b.services.items.grandOpening.name',
    descriptionKey: 'b2b.services.items.grandOpening.description'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.9, rotate: -1.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 150, damping: 16 }
  }
}

export default function B2BServicesSection() {
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

          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('b2b.services.title')}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('b2b.services.description')}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'
      >
        {SERVICES.map((service, index) => (
          <motion.article
            key={service.id}
            variants={cardItem}
            whileHover={{ y: -10, scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className='group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:p-6'
          >
            <motion.span
              aria-hidden='true'
              whileHover={{ scale: 1.12, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className='pointer-events-none absolute right-3 -top-1 font-title text-5xl font-bold leading-none text-secondary/40 transition-colors group-hover:text-secondary/70 sm:right-4 sm:-top-2 sm:text-6xl'
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>

            <div className='relative flex items-center gap-3'>
              <motion.div
                whileHover={{ rotate: -14, scale: 1.18 }}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  rotate: { type: 'spring', stiffness: 380, damping: 12 },
                  scale: { type: 'spring', stiffness: 380, damping: 12 },
                  y: { duration: 2.6 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className='grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:size-12'
              >
                <HugeiconsIcon icon={service.icon} className='size-5 sm:size-6' />
              </motion.div>

              <span className='inline-flex items-center rounded-full bg-secondary/60 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/10'>
                {t(service.tagKey)}
              </span>
            </div>

            <div className='relative flex-1 space-y-1.5'>
              <h3 className='font-title text-lg font-bold leading-tight text-primary sm:text-xl'>
                {t(service.nameKey)}
              </h3>
              <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{t(service.descriptionKey)}</p>
            </div>

            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16 }}
              className='relative mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-foreground'
            >
              {t('b2b.services.explore')}
              <motion.span
                className='inline-flex'
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <HugeiconsIcon icon={ArrowRight02Icon} className='size-3' />
              </motion.span>
            </motion.div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
