'use client'

import { fadeUp } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { motion } from 'motion/react'
import Image from 'next/image'

export default function WomenDayCampaignBanner() {
  const { t } = useTranslation()

  return (
    <div className='mt-8 px-4 sm:px-6 lg:px-0'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-[0_0.8rem_2rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'
      >
        <Image
          src='/images/banner web.jpg'
          alt={t('womenDay.campaignBanner.alt')}
          width={1280}
          height={400}
          sizes='(min-width: 1280px) 1280px, 100vw'
          className='h-auto w-full'
        />
      </motion.div>
    </div>
  )
}
