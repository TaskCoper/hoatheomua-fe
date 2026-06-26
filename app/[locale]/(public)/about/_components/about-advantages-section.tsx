'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import {
  CustomerService01Icon,
  DeliveryTruck01Icon,
  DiscountTag02Icon,
  EcoLab01Icon,
  Flower2Icon,
  GiftIcon,
  HandHeartIcon,
  HonorIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import DecorImage from './about-decor-image'

const ADVANTAGES = [
  {
    id: 1,
    icon: DiscountTag02Icon,
    titleKey: 'about.advantages.items.price.title',
    descriptionKey: 'about.advantages.items.price.description'
  },
  {
    id: 2,
    icon: Flower2Icon,
    titleKey: 'about.advantages.items.product.title',
    descriptionKey: 'about.advantages.items.product.description'
  },
  {
    id: 3,
    icon: HandHeartIcon,
    titleKey: 'about.advantages.items.emotional.title',
    descriptionKey: 'about.advantages.items.emotional.description'
  },
  {
    id: 4,
    icon: DeliveryTruck01Icon,
    titleKey: 'about.advantages.items.delivery.title',
    descriptionKey: 'about.advantages.items.delivery.description'
  },
  {
    id: 5,
    icon: CustomerService01Icon,
    titleKey: 'about.advantages.items.service.title',
    descriptionKey: 'about.advantages.items.service.description'
  },
  {
    id: 6,
    icon: EcoLab01Icon,
    titleKey: 'about.advantages.items.community.title',
    descriptionKey: 'about.advantages.items.community.description'
  },
  {
    id: 7,
    icon: HonorIcon,
    titleKey: 'about.advantages.items.culture.title',
    descriptionKey: 'about.advantages.items.culture.description'
  },
  {
    id: 8,
    icon: GiftIcon,
    titleKey: 'about.advantages.items.promotion.title',
    descriptionKey: 'about.advantages.items.promotion.description'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.86, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 180, damping: 16 }
  }
}

export default function AdvantagesSection() {
  const { t } = useTranslation()

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 overflow-hidden bg-secondary py-6 sm:py-8 lg:py-10'>
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-30'
        style={{
          backgroundImage: "url('/images/about/pattern.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 px-4 relative'
      >
        <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
          {t('about.advantages.title')}
        </h1>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-secondary-foreground/80'>
          {t('about.advantages.description')}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeUp}
        className='relative mx-auto mt-6 w-full max-w-7xl px-4'
      >
        <div className='relative aspect-8/3 w-full overflow-hidden rounded-3xl bg-linear-to-br from-secondary/70 via-muted to-card shadow-[0_0.8rem_2rem_rgb(81_108_108/12%)] ring-1 ring-foreground/5 sm:aspect-12/3'>
          <span aria-hidden='true' className='pointer-events-none absolute inset-0 grid place-items-center'>
            <HugeiconsIcon icon={Flower2Icon} className='size-12 text-primary/15' />
          </span>
          <DecorImage
            src='/images/about/studio-flatlay.png'
            alt={t('about.advantages.imageAlt')}
            sizes='(min-width: 1280px) 80rem, 100vw'
            quality={70}
            className='object-cover'
          />
        </div>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'
      >
        {ADVANTAGES.map((advantage, index) => (
          <motion.article
            key={advantage.id}
            variants={cardItem}
            whileHover={{ y: -10, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className='group relative flex gap-2.5 overflow-hidden rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:flex-col sm:p-5'
          >
            <motion.span
              aria-hidden='true'
              whileHover={{ scale: 1.25, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='pointer-events-none absolute right-2.5 top-1.5 font-title text-2xl font-bold leading-none text-secondary/50 transition-colors group-hover:text-secondary sm:text-3xl'
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>

            <motion.div
              whileHover={{ rotate: -16, scale: 1.2 }}
              animate={{ y: [0, -2, 0] }}
              transition={{
                rotate: { type: 'spring', stiffness: 380, damping: 12 },
                scale: { type: 'spring', stiffness: 380, damping: 12 },
                y: { duration: 2.5 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md sm:size-12'
            >
              <HugeiconsIcon icon={advantage.icon} className='size-5 sm:size-6' />
            </motion.div>

            <div className='space-y-0.5'>
              <h2 className='font-title text-sm font-bold leading-tight text-primary sm:text-base'>
                {t(advantage.titleKey)}
              </h2>
              <p className='text-xs leading-relaxed text-foreground'>{t(advantage.descriptionKey)}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
