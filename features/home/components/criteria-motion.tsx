'use client'

import { Award05Icon, DeliveryTruck01Icon, EcoEnergyIcon, Flower2Icon, PartyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const CRITERIAS = [
  { id: 1, icon: Flower2Icon, key: 'affordable', floatDuration: '2.4s' },
  { id: 100, icon: DeliveryTruck01Icon, key: 'gardenFresh', floatDuration: '2.7s' },
  { id: 200, icon: Award05Icon, key: 'fastDelivery', floatDuration: '3.0s' },
  { id: 300, icon: PartyIcon, key: 'dedicatedSupport', floatDuration: '2.6s' },
  { id: 400, icon: EcoEnergyIcon, key: 'ecoPack', floatDuration: '2.9s' }
] as const

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 16 } }
}

export type CriteriaStrings = Record<(typeof CRITERIAS)[number]['key'], { title: string; description: string }>

export default function CriteriaMotion({ strings }: { strings: CriteriaStrings }) {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-60px' }}
      variants={cardStagger}
      className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 z-10 sm:grid sm:grid-cols-6 sm:gap-x-4 sm:gap-y-4 sm:*:col-span-2 sm:[&>*:nth-child(4)]:col-start-2 lg:grid-cols-5 lg:gap-x-10 lg:*:col-span-1 lg:[&>*:nth-child(4)]:col-start-auto'
    >
      {CRITERIAS.map((criteria) => (
        <motion.div
          key={criteria.id}
          variants={cardItem}
          whileHover={{ y: -6, scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 280, damping: 16 }}
          className='group flex w-full flex-row gap-2 items-center sm:flex-col sm:text-center lg:text-left lg:items-start'
        >
          <motion.div
            className='float-y p-1.5 rounded-full flex justify-center items-center bg-primary w-fit shadow-lg'
            style={{ ['--float-duration' as string]: criteria.floatDuration }}
            whileHover={{ rotate: -12, scale: 1.18 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          >
            <HugeiconsIcon icon={criteria.icon} className='size-5 sm:size-6 md:size-7 text-white' />
          </motion.div>

          <div className='-space-y-0.5'>
            <p className='font-semibold text-foreground text-xs sm:text-sm lg:text-base line-clamp-1'>
              {strings[criteria.key].title}
            </p>
            <p className='text-[0.625rem] text-foreground'>{strings[criteria.key].description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
