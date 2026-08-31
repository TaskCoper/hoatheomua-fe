'use client'

import {
  cardItem,
  fadeUp,
  gridCols,
  petalCard,
  petalCardHover,
  Reveal,
  SectionHeading,
  SectionShell,
  stagger
} from '@/features/b2b/service/components/editorial'
import ServiceImageDivider from '@/features/b2b/service/components/service-image-divider'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/shared/utils'
import { Building03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

export default function ServiceAudienceSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.audience
  const items = (block?.items ?? [])
    .map((item) => ({ title: pick(item.title, locale), description: pick(item.description, locale) }))
    .filter((item) => item.title || item.description)
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.audienceTitle')
  const subIntro = pick(block!.subIntro, locale)
  const dividerImage = block?.image ?? null
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

        <motion.ul variants={stagger} className={cn('grid gap-3', gridCols(items.length, 3))}>
          {items.map((item, index) => {
            const label = item.title || item.description
            const description = item.title ? item.description : ''
            return (
              <motion.li
                key={index}
                variants={cardItem}
                className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}
              >
                <span className='grid size-9 shrink-0 place-items-center rounded-xl rounded-tl-[0.3125rem] bg-secondary/50 text-primary'>
                  <HugeiconsIcon icon={Building03Icon} className='size-4.5' />
                </span>
                <div className='min-w-0'>
                  <span className='text-sm font-medium leading-snug text-foreground'>{label}</span>
                  {description ? (
                    <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{description}</p>
                  ) : null}
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </Reveal>

      {dividerImage ? (
        <div className='mt-8'>
          <ServiceImageDivider src={dividerImage} alt={serviceName} />
        </div>
      ) : null}
    </SectionShell>
  )
}
