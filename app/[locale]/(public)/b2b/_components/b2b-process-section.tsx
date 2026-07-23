'use client'

import type { Locale } from '@/lib/i18n/routing'
import { DeliveryTruck01Icon, Note01Icon, PaintBoardIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { pick, type OverviewProcess } from '../_overview-palette'

// Icon stays in code, keyed by the CMS step `id`.
const STEP_ICON: Record<string, typeof Note01Icon> = {
  listen: Note01Icon,
  propose: PaintBoardIcon,
  sample: SparklesIcon,
  produce: DeliveryTruck01Icon
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

export default function B2BProcessSection({ process, locale }: { process: OverviewProcess; locale: Locale }) {
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
            {pick(process.eyebrow, locale)}
          </span>
        </div>

        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(process.title, locale)}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(process.description, locale)}
        </p>
      </motion.div>

      <motion.ol
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'
      >
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-7 left-12 right-12 hidden h-px bg-[repeating-linear-gradient(90deg,var(--primary)_0,var(--primary)_8px,transparent_8px,transparent_16px)] opacity-30 lg:block'
        />

        {process.steps.map((step, index) => (
          <motion.li
            key={step.id}
            variants={cardItem}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className='group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
          >
            <div className='relative flex items-center justify-between'>
              <motion.div
                whileHover={{ rotate: -12, scale: 1.18 }}
                animate={{ y: [0, -2, 0] }}
                transition={{
                  rotate: { type: 'spring', stiffness: 380, damping: 12 },
                  scale: { type: 'spring', stiffness: 380, damping: 12 },
                  y: { duration: 2.6 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className='relative z-10 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background'
              >
                <HugeiconsIcon icon={STEP_ICON[step.id] ?? SparklesIcon} className='size-5' />
              </motion.div>

              <span className='font-title text-3xl font-bold leading-none text-secondary/60 sm:text-4xl'>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className='space-y-1'>
              <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                {pick(step.label, locale)}
              </p>
              <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>
                {pick(step.title, locale)}
              </h3>
              <p className='text-xs leading-relaxed text-foreground'>{pick(step.description, locale)}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
