'use client'

import type { Locale } from '@/lib/i18n/routing'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { pick, type B2BServiceDetail } from '../_palette'
import { cardItem, Reveal, SectionHeading, SectionShell, stagger } from './editorial'

export default function ServiceProcessSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.process
  const steps = (block?.items ?? [])
    .map((item) => pick(item.title, locale) || pick(item.description, locale))
    .filter(Boolean)
  if (steps.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.processTitle')

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {/* Growing stem: each step is a node on the stalk, joined by a leaf-to-stem line. */}
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
                <span className='relative z-10 grid size-11 shrink-0 place-items-center rounded-full rounded-tl-[0.4375rem] bg-primary font-title text-base font-bold text-primary-foreground shadow-md shadow-primary/15 ring-4 ring-background'>
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
