'use client'

import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import newsFlowerOne from '@/public/images/10.webp'
import newsFlowerTwo from '@/public/images/11.webp'
import newsFlowerThree from '@/public/images/2.webp'
import newsFlowerFour from '@/public/images/3.webp'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import Image from 'next/image'

const STORIES = [
  { id: 'gratitude', image: newsFlowerOne },
  { id: 'mother', image: newsFlowerTwo },
  { id: 'choose', image: newsFlowerThree },
  { id: 'delivery', image: newsFlowerFour }
] as const

export default function WomenDayStoriesSection() {
  const { t } = useTranslation()

  return (
    <section className='px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
      <motion.h2
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto max-w-3xl text-center font-title text-3xl leading-tight font-bold text-primary sm:text-4xl'
      >
        {t('womenDay.stories.title')}
      </motion.h2>

      <div className='mx-auto mt-10 max-w-5xl space-y-8'>
        {STORIES.map((story, index) => {
          const isReversed = index % 2 === 1
          const title = t(`womenDay.stories.items.${story.id}.title`)

          return (
            <motion.article
              key={story.id}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className='grid overflow-hidden rounded-3xl bg-card shadow-[0_0.8rem_2rem_rgb(81_108_108/9%)] ring-1 ring-foreground/5 lg:grid-cols-2'
            >
              <motion.div
                variants={fadeUp}
                className={cn('relative min-h-64 overflow-hidden bg-secondary/25', isReversed && 'lg:order-2')}
              >
                <Image
                  src={story.image}
                  alt={title}
                  fill
                  sizes='(min-width: 1024px) 50vw, 100vw'
                  className='object-contain p-8 transition-transform duration-700 hover:scale-105'
                />
              </motion.div>
              <motion.div
                variants={fadeUp}
                className={cn('flex flex-col justify-center p-6 sm:p-8 lg:p-10', isReversed && 'lg:order-1')}
              >
                <p className='text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase'>
                  {t(`womenDay.stories.items.${story.id}.date`)} · {t('womenDay.stories.author')}
                </p>
                <h3 className='mt-3 font-title text-2xl leading-tight font-bold text-primary sm:text-3xl'>{title}</h3>
                <div className='mt-5 rounded-2xl bg-secondary/35 p-4 text-sm leading-relaxed text-foreground italic'>
                  {t(`womenDay.stories.items.${story.id}.lead`)}
                </div>
                <p className='mt-5 text-sm leading-relaxed text-foreground'>
                  {t(`womenDay.stories.items.${story.id}.body`)}
                </p>
              </motion.div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
