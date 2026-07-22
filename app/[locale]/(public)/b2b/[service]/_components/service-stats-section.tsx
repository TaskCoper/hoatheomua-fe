'use client'

import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ServiceI18nKey } from '../_content'
import { cardItem, Reveal, SectionShell, stagger } from './editorial'

type StatItem = { value: string; label: string; caption?: string }

type StatsBlock = {
  heading?: string
  items?: Record<string, StatItem>
} | null

export default function ServiceStatsSection({ serviceKey, id }: { serviceKey: ServiceI18nKey; id: string }) {
  const t = useTranslations()
  let raw: StatsBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${serviceKey}.stats`) as StatsBlock
  } catch {
    raw = null
  }
  const items = raw?.items ? Object.values(raw.items) : []
  if (items.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.statsTitle')

  return (
    <SectionShell id={id}>
      <Reveal>
        <motion.div
          variants={stagger}
          className='relative overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] bg-gradient-to-br from-primary via-primary to-primary/85 p-6 text-primary-foreground shadow-xl shadow-primary/20 sm:p-8 lg:p-10'
        >
          <motion.h2
            variants={cardItem}
            className='relative font-title text-primary-foreground text-xl font-bold leading-tight sm:text-2xl'
          >
            {heading}
          </motion.h2>

          <motion.dl
            variants={stagger}
            className={cn(
              'relative mt-6 grid gap-6 sm:mt-8',
              items.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
            )}
          >
            {items.map((item, index) => (
              <motion.div key={index} variants={cardItem} className='border-t-2 border-secondary/40 pt-4'>
                <dd className='font-title text-3xl font-bold leading-none tracking-tight sm:text-4xl lg:text-[2.75rem]'>
                  {item.value}
                </dd>
                <dt className='mt-2 text-sm leading-snug text-primary-foreground/80'>{item.label}</dt>
                {item.caption ? <p className='mt-1 text-xs text-primary-foreground/60'>{item.caption}</p> : null}
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </Reveal>
    </SectionShell>
  )
}
