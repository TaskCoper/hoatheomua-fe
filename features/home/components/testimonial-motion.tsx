'use client'

import TestimonialCarousel from '@/features/home/components/testimonial-carousel'
import type { Locale } from '@/lib/i18n/routing'
import type { FeedbackItem } from '@/types/config.type'
import { QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function TestimonialMotion({
  title,
  items,
  locale
}: {
  title: string
  items: FeedbackItem[]
  locale: Locale
}) {
  return (
    <>
      <div className='banner-drift pointer-events-none absolute -left-4 top-2 sm:left-8 sm:top-4' aria-hidden='true'>
        <HugeiconsIcon icon={QuoteUpIcon} className='size-16 text-card/60 sm:size-24' />
      </div>

      <div className='mx-auto w-full max-w-7xl space-y-4 px-4 py-4 relative'>
        {/* h2: the home page's single h1 is the "Hoa Mỗi Ngày" section heading. */}
        <motion.h2
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className='text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'
        >
          {title}
        </motion.h2>

        <TestimonialCarousel items={items} locale={locale} />
      </div>
    </>
  )
}
