'use client'

import { Button } from '@/components/ui/button'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import ViewportImage from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } }
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
const isVideoSrc = (src: string): boolean => {
  // `#` first: a stored URL may carry an `#iv=` framing token after the extension.
  const path = src.split('#')[0].split('?')[0].toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

export default function ServiceDetailHero({ detail, locale }: { detail: B2BServiceDetail; locale: Locale }) {
  const { t } = useTranslation()
  const name = pick(detail.card.name, locale)
  const lede = pick(detail.lede, locale)
  const primaryCta = t('b2b.serviceDetails.common.primaryCta')
  const secondaryCta = t('b2b.serviceDetails.common.secondaryCta')
  const hasHeroMedia = Boolean(detail.heroImage)

  return (
    <section className={cn('relative mt-6 px-4 sm:mt-8', !hasHeroMedia && 'pb-10 sm:pb-14')}>
      <motion.div initial='hidden' animate='visible' variants={container} className='mx-auto w-full max-w-7xl'>
        <motion.h1
          variants={fadeUp}
          className='mt-5 text-pretty font-title text-4xl font-bold leading-[1.08] tracking-[-0.01em] text-primary sm:text-5xl lg:text-6xl'
        >
          {name}
        </motion.h1>

        <motion.p variants={fadeUp} className='mt-5 text-base leading-relaxed text-foreground/90 sm:text-lg'>
          {lede}
        </motion.p>

        <motion.div variants={fadeUp} className='mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center'>
          <Button asChild size='lg' className='w-full sm:w-auto'>
            <Link href='/contact'>
              {primaryCta}
              <HugeiconsIcon icon={ArrowRight02Icon} />
            </Link>
          </Button>
          {detail.showPackagesLink ? (
            <Button asChild size='lg' variant='ghost' className='w-full text-primary sm:w-auto'>
              <Link href='/b2b#b2b-packages'>{secondaryCta}</Link>
            </Button>
          ) : null}
        </motion.div>

        {hasHeroMedia ? (
          <motion.div variants={fadeUp} className='relative mt-10'>
            <span
              aria-hidden='true'
              className='absolute -bottom-2.5 -right-2.5 left-6 top-6 rounded-[2.75rem] rounded-tl-[0.875rem] bg-secondary/50 sm:-bottom-3.5 sm:-right-3.5'
            />
            <figure className='relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] rounded-tl-[0.75rem] bg-muted shadow-xl shadow-primary/10 ring-1 ring-primary/10 sm:aspect-[16/8] lg:aspect-[16/7]'>
              {isVideoSrc(detail.heroImage) ? (
                <video
                  src={detail.heroImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className='absolute inset-0 size-full object-cover'
                />
              ) : (
                <ViewportImage
                  src={detail.heroImage}
                  alt={name}
                  priority
                  className='object-cover'
                  sizes='(min-width: 1280px) 80rem, 100vw'
                />
              )}
              <span
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent'
              />
            </figure>
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  )
}
