'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Award05Icon, DeliveryTruck01Icon, EcoEnergyIcon, Flower2Icon, PartyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const CRITERIAS = [
  {
    id: 1,
    icon: Flower2Icon,
    titleKey: 'home.criteria.affordable.title',
    descriptionKey: 'home.criteria.affordable.description'
  },
  {
    id: 100,
    icon: DeliveryTruck01Icon,
    titleKey: 'home.criteria.gardenFresh.title',
    descriptionKey: 'home.criteria.gardenFresh.description'
  },
  {
    id: 200,
    icon: Award05Icon,
    titleKey: 'home.criteria.fastDelivery.title',
    descriptionKey: 'home.criteria.fastDelivery.description'
  },
  {
    id: 300,
    icon: PartyIcon,
    titleKey: 'home.criteria.dedicatedSupport.title',
    descriptionKey: 'home.criteria.dedicatedSupport.description'
  },
  {
    id: 400,
    icon: EcoEnergyIcon,
    titleKey: 'home.criteria.ecoPack.title',
    descriptionKey: 'home.criteria.ecoPack.description'
  }
] as const

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.86, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 180, damping: 16 }
  }
}

export default function CriteriaSection() {
  const { t } = useTranslation()

  return (
    <div className='w-full bg-secondary flex items-center relative py-4 lg:py-10'>
      {/* <Image
        src={leftBranch}
        alt={t('home.criteria.branchAlt')}
        className='wind-wiggle-left h-3/4 w-auto absolute -left-4 top-1/2 -translate-y-1/2 opacity-70 hidden lg:block pointer-events-none'
        aria-hidden='true'
      /> */}

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 z-10 sm:grid sm:grid-cols-6 sm:gap-x-4 sm:gap-y-4 sm:*:col-span-2 sm:[&>*:nth-child(4)]:col-start-2 lg:grid-cols-5 lg:gap-x-10 lg:*:col-span-1 lg:[&>*:nth-child(4)]:col-start-auto'
      >
        {CRITERIAS.map((criteria, index) => (
          <motion.div
            key={criteria.id}
            variants={cardItem}
            whileHover={{ y: -6, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className='flex w-full flex-row gap-2 items-center sm:flex-col sm:text-center lg:text-left lg:items-start'
          >
            <motion.div
              whileHover={{ rotate: -16, scale: 1.18 }}
              animate={{ y: [0, -3, 0] }}
              transition={{
                rotate: { type: 'spring', stiffness: 380, damping: 12 },
                scale: { type: 'spring', stiffness: 380, damping: 12 },
                y: { duration: 2.6 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='p-1.5 rounded-full flex justify-center items-center bg-primary w-fit shadow-lg'
            >
              <HugeiconsIcon icon={criteria.icon} className='size-5 sm:size-6 md:size-7 text-white' />
            </motion.div>

            <div className='-space-y-0.5'>
              <p className='font-semibold text-foreground text-xs sm:text-sm lg:text-base line-clamp-1'>
                {t(criteria.titleKey)}
              </p>
              <p className='text-[0.625rem] text-foreground'>{t(criteria.descriptionKey)}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* <Image
        src={rightBranch}
        alt={t('home.criteria.branchAlt')}
        className='wind-wiggle-right h-3/4 w-auto absolute -right-4 top-1/2 -translate-y-1/2 opacity-70 hidden lg:block pointer-events-none'
        aria-hidden='true'
      /> */}
    </div>
  )
}
