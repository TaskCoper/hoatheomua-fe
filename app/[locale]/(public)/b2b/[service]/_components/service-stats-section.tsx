'use client'

import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { pick, type B2BServiceDetail } from '../_palette'
import { cardItem, Reveal, SectionShell, stagger } from './editorial'

export default function ServiceStatsSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.stats
  const items = (block?.items ?? []).map((item) => ({
    value: pick(item.value, locale),
    label: pick(item.label, locale),
    caption: pick(item.caption, locale)
  }))
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.statsTitle')

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
