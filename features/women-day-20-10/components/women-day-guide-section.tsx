'use client'

import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import womensDay from '@/public/images/about/bg-product-womens-day.png'
import { Flower2Icon, HeartCheckIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import Image from 'next/image'

const GUIDES = [
  { id: 'mother', icon: HeartCheckIcon },
  { id: 'lover', icon: Flower2Icon },
  { id: 'colleague', icon: SparklesIcon }
] as const

export default function WomenDayGuideSection() {
  const { t } = useTranslation()

  return (
    <section
      id='guide'
      className='relative scroll-mt-header overflow-hidden bg-secondary/45 px-4 py-14 sm:px-6 sm:py-18 lg:py-22'
    >
      <Image src={womensDay} alt='' fill sizes='100vw' className='pointer-events-none object-cover opacity-20' />
      <div className='relative mx-auto max-w-7xl'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={stagger}
          className='mx-auto max-w-2xl text-center'
        >
          <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>
            {t('womenDay.guide.eyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className='mt-2 font-title text-3xl font-bold text-primary sm:text-4xl'>
            {t('womenDay.guide.title')}
          </motion.h2>
          <motion.p variants={fadeUp} className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>
            {t('womenDay.guide.intro')}
          </motion.p>
        </motion.div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {GUIDES.map((guide) => (
            <motion.article
              key={guide.id}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className='rounded-3xl bg-card/90 p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 backdrop-blur-sm'
            >
              <div className='grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md'>
                <HugeiconsIcon icon={guide.icon} className='size-5' />
              </div>
              <h3 className='mt-4 font-title text-xl font-bold text-primary'>
                {t(`womenDay.guide.${guide.id}.title`)}
              </h3>
              <p className='mt-1 text-sm leading-relaxed text-foreground'>{t(`womenDay.guide.${guide.id}.text`)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
