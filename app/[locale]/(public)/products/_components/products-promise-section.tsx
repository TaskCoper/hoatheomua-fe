'use client'

import ConfigurableBanner from '@/app/[locale]/(public)/_components/configurable-banner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import saleBanner from '@/public/images/sale-banner.webp'
import { type BannerSlot } from '@/types/config.type'
import { DeliveryTruck01Icon, Flower2Icon, MessageMultiple02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const PROMISES = [
  {
    icon: Flower2Icon,
    titleKey: 'products.promise.items.fresh.title',
    descriptionKey: 'products.promise.items.fresh.description'
  },
  {
    icon: DeliveryTruck01Icon,
    titleKey: 'products.promise.items.delivery.title',
    descriptionKey: 'products.promise.items.delivery.description'
  },
  {
    icon: MessageMultiple02Icon,
    titleKey: 'products.promise.items.support.title',
    descriptionKey: 'products.promise.items.support.description'
  }
] as const

const bannerReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

type ProductsPromiseSectionProps = {
  slot?: BannerSlot
}

export default function ProductsPromiseSection({ slot }: ProductsPromiseSectionProps = {}) {
  const { t } = useTranslation()
  const bannerAlt = t('products.promise.bannerAlt')
  const bannerClassName =
    'w-full h-auto rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl shadow-lg border-2 border-primary/5'
  const bannerSizes = '(min-width: 1280px) 1200px, 100vw'

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4 pb-12'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={bannerReveal}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className='mx-auto w-full max-w-7xl'
      >
        {slot ? (
          <ConfigurableBanner
            slot={slot}
            fallbackSrc={saleBanner}
            fallbackAlt={bannerAlt}
            className={bannerClassName}
            sizes={bannerSizes}
          />
        ) : (
          <Image
            src={saleBanner}
            alt={bannerAlt}
            className={bannerClassName}
            sizes={bannerSizes}
            loading='lazy'
            quality={65}
          />
        )}
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-2 sm:grid-cols-1 sm:gap-4 lg:gap-5'
      >
        {PROMISES.map((promise) => (
          <motion.article
            key={promise.titleKey}
            variants={cardItem}
            whileHover={{ y: -8, scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className='group relative flex gap-2 overflow-hidden rounded-3xl bg-card p-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
          >
            <motion.div
              whileHover={{ rotate: -14, scale: 1.18 }}
              transition={{
                rotate: { type: 'spring', stiffness: 380, damping: 12 },
                scale: { type: 'spring', stiffness: 380, damping: 12 },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/70 text-primary shadow-sm ring-1 ring-primary/10'
            >
              <HugeiconsIcon icon={promise.icon} className='size-5' />
            </motion.div>

            <div className='space-y-1'>
              <h3 className='font-title text-base font-bold leading-tight text-primary lg:text-lg'>
                {t(promise.titleKey)}
              </h3>
              <p className='text-xs leading-relaxed text-foreground'>{t(promise.descriptionKey)}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
