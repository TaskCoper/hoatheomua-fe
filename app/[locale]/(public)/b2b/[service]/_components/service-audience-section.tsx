'use client'

import { cn } from '@/shared/utils'
import { Building03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ServiceDetailConfig } from '../_content'
import { cardItem, fadeUp, petalCard, petalCardHover, Reveal, SectionHeading, SectionShell, stagger } from './editorial'

type AudienceBlock = {
  heading?: string
  subIntro?: string
  items?: Record<string, string>
} | null

export default function ServiceAudienceSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  let raw: AudienceBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.audience`) as AudienceBlock
  } catch {
    raw = null
  }
  const items = raw?.items ? Object.values(raw.items) : []
  if (items.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.audienceTitle')

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {raw?.subIntro ? (
          <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
            {raw.subIntro}
          </motion.p>
        ) : null}

        <motion.ul variants={stagger} className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item, index) => (
            <motion.li
              key={index}
              variants={cardItem}
              className={cn(petalCard, petalCardHover, 'flex items-center gap-3 p-4')}
            >
              <span className='grid size-9 shrink-0 place-items-center rounded-xl rounded-tl-[0.3125rem] bg-secondary/50 text-primary'>
                <HugeiconsIcon icon={Building03Icon} className='size-4.5' />
              </span>
              <span className='text-sm font-medium leading-snug text-foreground'>{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Reveal>
    </SectionShell>
  )
}
