'use client'

import type { Locale } from '@/lib/i18n/routing'
import { Calendar03Icon, HandHeartIcon, Note01Icon, PaintBoardIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { pick, type OverviewAdvantages } from '@/features/b2b/overview-palette'

// Icon stays in code, keyed by the CMS advantage `id`.
const ADVANTAGE_ICON: Record<string, typeof Calendar03Icon> = {
  onTime: Calendar03Icon,
  singlePoc: HandHeartIcon,
  brandAligned: PaintBoardIcon,
  transparent: Note01Icon
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotate: -1.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 180, damping: 16 }
  }
}

export default function B2BAdvantagesSection({
  advantages,
  locale
}: {
  advantages: OverviewAdvantages
  locale: Locale
}) {
  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2'
      >
        <div className='flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[0.625rem] font-semibold tracking-wide text-primary ring-1 ring-primary/15 sm:text-xs'>
            <HugeiconsIcon icon={SparklesIcon} className='size-3.5' />
            {pick(advantages.eyebrow, locale)}
          </span>
        </div>

        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(advantages.title, locale)}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(advantages.description, locale)}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'
      >
        {advantages.items.map((advantage, index) => (
          <motion.article
            key={advantage.id}
            variants={cardItem}
            whileHover={{ y: -10, scale: 1.035 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className='group relative flex flex-col gap-2.5 overflow-hidden rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:p-5'
          >
            <motion.span
              aria-hidden='true'
              whileHover={{ scale: 1.2, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='pointer-events-none absolute right-2.5 top-1.5 font-title text-2xl font-bold leading-none text-secondary/45 transition-colors group-hover:text-secondary sm:text-3xl'
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>

            <motion.div
              whileHover={{ rotate: -14, scale: 1.18 }}
              animate={{ y: [0, -2, 0] }}
              transition={{
                rotate: { type: 'spring', stiffness: 380, damping: 12 },
                scale: { type: 'spring', stiffness: 380, damping: 12 },
                y: { duration: 2.5 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:size-12'
            >
              <HugeiconsIcon icon={ADVANTAGE_ICON[advantage.id] ?? SparklesIcon} className='size-5 sm:size-6' />
            </motion.div>

            <div className='space-y-1'>
              <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>
                {pick(advantage.title, locale)}
              </h3>
              <p className='text-xs leading-relaxed text-foreground'>{pick(advantage.description, locale)}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
