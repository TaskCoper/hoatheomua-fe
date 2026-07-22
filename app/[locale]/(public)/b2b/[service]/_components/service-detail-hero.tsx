'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import type { I18nKey } from '@/lib/i18n/types'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import type { ServiceDetailConfig } from '../_content'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } }
}

type Props = {
  service: ServiceDetailConfig
}

export default function ServiceDetailHero({ service }: Props) {
  const { t } = useTranslation()
  const ledeKey = `b2b.serviceDetails.${service.i18nKey}.lede` as I18nKey
  const primaryCta = t('b2b.serviceDetails.common.primaryCta')
  const secondaryCta = t('b2b.serviceDetails.common.secondaryCta')

  return (
    <section className='relative mt-6 px-4 sm:mt-8'>
      <motion.div initial='hidden' animate='visible' variants={container} className='mx-auto w-full max-w-7xl'>
        <motion.h1
          variants={fadeUp}
          className='mt-5 text-pretty font-title text-4xl font-bold leading-[1.08] tracking-[-0.01em] text-primary sm:text-5xl lg:text-6xl'
        >
          {t(service.cardNameKey as I18nKey)}
        </motion.h1>

        <motion.p variants={fadeUp} className='mt-5 text-base leading-relaxed text-foreground/90 sm:text-lg'>
          {t(ledeKey)}
        </motion.p>

        <motion.div variants={fadeUp} className='mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center'>
          <Button asChild size='lg' className='w-full sm:w-auto'>
            <Link href='/contact'>
              {primaryCta}
              <HugeiconsIcon icon={ArrowRight02Icon} />
            </Link>
          </Button>
          {service.showPackagesLink ? (
            <Button asChild size='lg' variant='ghost' className='w-full text-primary sm:w-auto'>
              <Link href='/b2b#b2b-packages'>{secondaryCta}</Link>
            </Button>
          ) : null}
        </motion.div>

        {/* Large hero image on a mint offset backdrop */}
        <motion.div variants={fadeUp} className='relative mt-10'>
          <span
            aria-hidden='true'
            className='absolute -bottom-2.5 -right-2.5 left-6 top-6 rounded-[2.75rem] rounded-tl-[0.875rem] bg-secondary/50 sm:-bottom-3.5 sm:-right-3.5'
          />
          <figure className='relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] rounded-tl-[0.75rem] bg-muted shadow-xl shadow-primary/10 ring-1 ring-primary/10 sm:aspect-[16/8] lg:aspect-[16/7]'>
            {service.hasHero && service.heroImage ? (
              <Image
                src={service.heroImage}
                alt={t(service.cardNameKey as I18nKey)}
                fill
                priority
                className='object-cover'
                sizes='(min-width: 1280px) 80rem, 100vw'
              />
            ) : (
              <GradientHero accent={service.accent} icon={service.icon} label={t(service.cardTagKey as I18nKey)} />
            )}
            <span
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent'
            />
          </figure>
        </motion.div>
      </motion.div>
    </section>
  )
}

function GradientHero({
  icon,
  accent,
  label
}: {
  icon: ServiceDetailConfig['icon']
  accent: ServiceDetailConfig['accent']
  label: string
}) {
  return (
    <div
      className={`relative flex h-full items-center justify-center overflow-hidden p-8 ${
        accent === 'leaf'
          ? 'bg-gradient-to-br from-leaf via-leaf/90 to-primary/70'
          : 'bg-gradient-to-br from-primary via-primary/95 to-primary/70'
      }`}
    >
      <div className='relative flex flex-col items-center gap-4 text-primary-foreground'>
        <span className='grid size-20 place-items-center rounded-3xl bg-primary-foreground/15 ring-1 ring-primary-foreground/25 backdrop-blur-sm sm:size-24'>
          <HugeiconsIcon icon={icon} className='size-10 sm:size-12' />
        </span>
        <span className='font-title text-lg font-semibold sm:text-xl'>{label}</span>
      </div>
    </div>
  )
}
