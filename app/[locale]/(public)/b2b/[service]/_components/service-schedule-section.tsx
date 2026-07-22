'use client'

import { cn } from '@/shared/utils'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ServiceDetailConfig } from '../_content'
import { cardItem, fadeUp, petalCard, petalCardHover, Reveal, SectionHeading, SectionShell, stagger } from './editorial'

type ScheduleBlock = {
  heading?: string
  subIntro?: string
  items?: Record<string, string>
  closing?: string
} | null

export default function ServiceScheduleSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  let raw: ScheduleBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.schedule`) as ScheduleBlock
  } catch {
    raw = null
  }
  const items = raw?.items ? Object.values(raw.items) : []
  if (items.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.scheduleTitle')

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {raw?.subIntro ? (
          <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
            {raw.subIntro}
          </motion.p>
        ) : null}

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

        {raw?.closing ? (
          <motion.p
            variants={fadeUp}
            className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'
          >
            {raw.closing}
          </motion.p>
        ) : null}
      </Reveal>
    </SectionShell>
  )
}
