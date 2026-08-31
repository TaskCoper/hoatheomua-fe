'use client'

import {
  cardItem,
  fadeUp,
  petalCard,
  petalCardHover,
  Reveal,
  SectionHeading,
  SectionShell,
  stagger
} from '@/features/b2b/service/components/editorial'
import ServiceImageSplit from '@/features/b2b/service/components/service-image-split'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/shared/utils'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

export default function ServiceScheduleSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.schedule
  const items = (block?.items ?? [])
    .map((item) => pick(item.title, locale) || pick(item.description, locale))
    .filter(Boolean)
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.scheduleTitle')
  const subIntro = pick(block!.subIntro, locale)
  const closing = pick(block!.closing, locale)
  const splitImage = block?.image ?? null
  const serviceName = pick(detail.card.name, locale)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {subIntro ? (
          <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
            {subIntro}
          </motion.p>
        ) : null}

        <ServiceImageSplit src={splitImage} alt={serviceName}>
          <motion.ul variants={stagger} className='grid gap-3 sm:grid-cols-2'>
            {items.map((item, index) => (
              <motion.li
                key={index}
                variants={cardItem}
                className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}
              >
                <span className='grid size-9 shrink-0 place-items-center rounded-xl rounded-tl-[0.3125rem] bg-secondary/50 text-primary'>
                  <HugeiconsIcon icon={Calendar03Icon} className='size-4.5' />
                </span>
                <span className='pt-1 text-sm leading-relaxed text-foreground'>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </ServiceImageSplit>

        {closing ? (
          <motion.p
            variants={fadeUp}
            className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'
          >
            {closing}
          </motion.p>
        ) : null}
      </Reveal>
    </SectionShell>
  )
}
