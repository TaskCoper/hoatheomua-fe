'use client'

import { cn } from '@/shared/utils'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ServiceDetailConfig } from '../_content'
import { cardItem, Reveal, SectionHeading, SectionShell, stagger } from './editorial'

type ProcessBlock = {
  heading?: string
  items?: Record<string, string>
} | null

export default function ServiceProcessSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  let raw: ProcessBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.process`) as ProcessBlock
  } catch {
    raw = null
  }
  const steps = raw?.items ? Object.values(raw.items) : []
  if (steps.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.processTitle')

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {/* Growing stem: each step is a node on the stalk; the last one blooms in leaf. */}
        <motion.ol variants={stagger} className='mt-2'>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            return (
              <motion.li key={index} variants={cardItem} className='relative flex gap-5 pb-8 last:pb-0'>
                {!isLast ? (
                  <span
                    aria-hidden='true'
                    className='absolute left-[1.375rem] top-12 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-leaf/50 to-primary/15'
                  />
                ) : null}
                <span
                  className={cn(
                    'relative z-10 grid size-11 shrink-0 place-items-center rounded-full rounded-tl-[0.4375rem] font-title text-base font-bold shadow-md shadow-primary/15 ring-4 ring-background',
                    isLast ? 'bg-leaf text-leaf-foreground' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className='pt-2.5 text-sm leading-relaxed text-foreground sm:text-base'>{step}</p>
              </motion.li>
            )
          })}
        </motion.ol>
      </Reveal>
    </SectionShell>
  )
}
