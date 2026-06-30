'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { EyeIcon, HandHeartIcon, QuoteDownIcon, QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } }
}

const cardIn: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 18 } }
}

const quoteIn: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -20 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 14 } }
}

export default function AboutVisionMissionSection() {
  const { t } = useTranslation()

  return (
    <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={containerStagger}
        className='relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-linear-to-br from-secondary/40 via-card to-secondary/15 p-6 ring-1 ring-foreground/5 shadow-[0_0.8rem_2.4rem_rgb(81_108_108/10%)] sm:p-8 md:p-10 lg:p-12'
      >
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 opacity-[0.06]'
          style={{
            backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '14rem'
          }}
        />

        <motion.div
          variants={quoteIn}
          animate={{ y: [0, -6, 0], rotate: [0, -4, 0, 4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className='pointer-events-none absolute -left-2 -top-2 sm:left-2 sm:top-2'
        >
          <HugeiconsIcon icon={QuoteUpIcon} className='size-10 text-primary/25 fill-primary/15 sm:size-14' />
        </motion.div>

        <motion.div
          variants={quoteIn}
          animate={{ y: [0, 6, 0], rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className='pointer-events-none absolute -right-2 -bottom-2 sm:right-2 sm:bottom-2'
        >
          <HugeiconsIcon icon={QuoteDownIcon} className='size-10 text-primary/25 fill-primary/15 sm:size-14' />
        </motion.div>

        <motion.blockquote
          variants={fadeUp}
          className='relative mx-auto max-w-3xl text-center font-title text-lg font-bold italic leading-snug text-primary sm:text-2xl md:text-3xl lg:text-4xl'
        >
          &ldquo;{t('about.visionMission.motto')}&rdquo;
        </motion.blockquote>

        <motion.div variants={fadeUp} className='relative mx-auto mt-4 flex w-fit items-center gap-2 sm:mt-5'>
          <span aria-hidden='true' className='h-px w-8 bg-primary/40 sm:w-12' />
          <span className='text-[0.625rem] font-semibold tracking-[0.3em] text-primary/70 sm:text-xs'>
            {t('about.visionMission.title')}
          </span>
          <span aria-hidden='true' className='h-px w-8 bg-primary/40 sm:w-12' />
        </motion.div>

        <motion.div
          variants={containerStagger}
          className='relative mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2 lg:gap-5'
        >
          <motion.article
            variants={cardIn}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className='group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 ring-1 ring-foreground/5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] sm:p-6'
          >
            <span
              aria-hidden='true'
              className='pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-secondary/40 blur-2xl'
            />

            <div className='relative flex items-center gap-3'>
              <motion.div
                whileHover={{ rotate: -16, scale: 1.18 }}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  rotate: { type: 'spring', stiffness: 380, damping: 12 },
                  scale: { type: 'spring', stiffness: 380, damping: 12 },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className='grid size-11 place-items-center rounded-2xl bg-secondary/70 text-primary ring-1 ring-primary/10 shadow-sm sm:size-12'
              >
                <HugeiconsIcon icon={EyeIcon} className='size-5 sm:size-6' />
              </motion.div>
              <p className='text-[0.625rem] font-bold uppercase tracking-[0.25em] text-primary/70 sm:text-xs'>
                {t('about.visionMission.vision.label')}
              </p>
            </div>

            <p className='relative text-sm leading-relaxed text-foreground italic sm:text-base'>
              &ldquo;{t('about.visionMission.vision.statement')}&rdquo;
            </p>
          </motion.article>

          <motion.article
            variants={cardIn}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className='group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_0.8rem_2rem_rgb(81_108_108/18%)] sm:p-6'
          >
            <span
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 opacity-10'
              style={{
                backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
                backgroundRepeat: 'repeat',
                backgroundSize: '14rem'
              }}
            />

            <span
              aria-hidden='true'
              className='pointer-events-none absolute -left-8 -bottom-8 size-32 rounded-full bg-primary-foreground/10 blur-2xl'
            />

            <div className='relative flex items-center gap-3'>
              <motion.div
                whileHover={{ rotate: 16, scale: 1.18 }}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  rotate: { type: 'spring', stiffness: 380, damping: 12 },
                  scale: { type: 'spring', stiffness: 380, damping: 12 },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }
                }}
                className='grid size-11 place-items-center rounded-2xl bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/25 sm:size-12'
              >
                <HugeiconsIcon icon={HandHeartIcon} className='size-5 sm:size-6' />
              </motion.div>
              <p className='text-[0.625rem] font-bold uppercase tracking-[0.25em] text-primary-foreground/80 sm:text-xs'>
                {t('about.visionMission.mission.label')}
              </p>
            </div>

            <p className='relative text-sm leading-relaxed text-primary-foreground/95 italic sm:text-base'>
              &ldquo;{t('about.visionMission.mission.statement')}&rdquo;
            </p>
          </motion.article>
        </motion.div>
      </motion.div>
    </section>
  )
}
