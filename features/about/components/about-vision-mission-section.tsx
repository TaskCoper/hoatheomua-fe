'use client'

import DecorImage from '@/features/about/components/about-decor-image'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { EyeIcon, HandHeartIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
}

const photoIn: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
}

const plateIn: Variants = {
  hidden: { opacity: 0, x: -28, y: 16 },
  visible: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } }
}

const stemGrow: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: 'easeOut', delay: 0.2 } }
}

export default function AboutVisionMissionSection() {
  const { t } = useTranslation()

  const mottoLines = t('about.visionMission.motto')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const branches = [
    {
      key: 'vision',
      icon: EyeIcon,
      label: t('about.visionMission.vision.label'),
      statement: t('about.visionMission.vision.statement'),
      hoverRotate: -12
    },
    {
      key: 'mission',
      icon: HandHeartIcon,
      label: t('about.visionMission.mission.label'),
      statement: t('about.visionMission.mission.statement'),
      hoverRotate: 12
    }
  ] as const

  return (
    <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={containerStagger}
        className='relative mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-12 lg:items-center'
      >
        <motion.div
          variants={photoIn}
          className='relative h-56 overflow-hidden rounded-[1.5rem] shadow-[0_1rem_2.5rem_rgb(81_108_108/18%)] sm:h-72 lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:h-[27rem] lg:rounded-[2.5rem]'
        >
          <DecorImage
            src='/images/about/studio-flatlay.png'
            sizes='(min-width: 1024px) 66vw, 100vw'
            quality={70}
            className='object-cover object-center'
            fallback={<span aria-hidden='true' className='absolute inset-0 bg-secondary' />}
          />

          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 bg-linear-to-t from-primary/80 via-primary/20 to-transparent lg:bg-linear-to-r lg:from-primary/85 lg:via-primary/15 lg:to-transparent'
          />
        </motion.div>

        <motion.div
          variants={plateIn}
          className='relative z-10 -mt-16 rounded-[1.5rem] bg-primary text-primary-foreground shadow-[0_1.5rem_3.5rem_rgb(31_46_46/32%)] sm:-mt-24 sm:rounded-[2rem] lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:rounded-[2.5rem]'
        >
          <span
            aria-hidden='true'
            className='pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-secondary/20 blur-[4rem]'
          />
          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-2 rounded-[1.15rem] ring-1 ring-primary-foreground/10 sm:inset-2.5 sm:rounded-[1.65rem] lg:rounded-[2.15rem]'
          />

          <div className='relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11'>
            <motion.div variants={fadeUp} className='flex items-center gap-3'>
              <span aria-hidden='true' className='h-px w-8 bg-primary-foreground/35 sm:w-10' />
              <span className='text-sm font-semibold text-primary-foreground/80'>{t('about.visionMission.title')}</span>
            </motion.div>

            <motion.blockquote variants={fadeUp} className='mt-4 sm:mt-5'>
              {mottoLines.map((line, index) => (
                <span
                  key={line}
                  className={`block text-pretty font-title text-xl font-bold leading-[1.3] sm:text-2xl lg:text-[1.9rem] ${
                    index === 0 ? 'text-primary-foreground' : 'text-primary-foreground'
                  }`}
                >
                  {index === 0 && <>&ldquo;</>}
                  {line}
                  {index === mottoLines.length - 1 && <>&rdquo;</>}
                </span>
              ))}
            </motion.blockquote>

            <motion.div variants={fadeUp} className='relative mt-7 space-y-6 pl-11 sm:mt-8 sm:space-y-7 sm:pl-12'>
              <motion.span
                aria-hidden='true'
                variants={stemGrow}
                className='absolute left-[1.3125rem] top-4 bottom-4 w-px origin-top bg-linear-to-b from-primary-foreground/40 via-primary-foreground/25 to-transparent sm:left-6'
              />

              {branches.map((branch, index) => (
                <motion.article key={branch.key} variants={fadeUp} className='group relative'>
                  <div
                    className='icon-bob absolute -left-11 top-0 sm:-left-12'
                    style={index > 0 ? ({ ['--bob-delay' as string]: '1.2s' } as const) : undefined}
                  >
                    <motion.div
                      whileHover={{ rotate: branch.hoverRotate, scale: 1.14 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                      className='grid size-9 place-items-center rounded-full bg-primary text-primary-foreground ring-1 ring-primary-foreground/30 sm:size-10'
                    >
                      <HugeiconsIcon icon={branch.icon} className='size-4.5 sm:size-5' />
                    </motion.div>
                  </div>

                  <p className='text-sm font-medium text-primary-foreground/75'>{branch.label}</p>
                  <p className='mt-1.5 text-pretty text-sm leading-relaxed text-primary-foreground/90 sm:text-[0.9375rem]'>
                    {branch.statement}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
