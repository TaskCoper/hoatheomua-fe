'use client'

import { QuoteDownIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ServiceDetailConfig } from '../_content'
import { fadeUp, Reveal, SectionShell } from './editorial'

type ClosingBlock = {
  heading?: string
  paragraphs?: Record<string, string>
} | null

export default function ServiceClosingSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  const raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.closing`) as ClosingBlock
  const paragraphs = raw?.paragraphs ? Object.values(raw.paragraphs) : []
  if (paragraphs.length === 0) return null

  return (
    <SectionShell id={id}>
      <Reveal>
        <motion.div
          variants={fadeUp}
          className='relative overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] border border-primary/10 bg-gradient-to-br from-secondary/50 via-card/40 to-leaf/15 p-6 shadow-md shadow-primary/5 sm:p-10'
        >
          <span
            aria-hidden='true'
            className='pointer-events-none absolute -right-6 -top-4 text-primary/10'
          >
            <HugeiconsIcon icon={QuoteDownIcon} className='size-28 sm:size-36' />
          </span>

          <div className='relative border-l-4 border-leaf pl-5 sm:pl-6'>
            {raw?.heading ? (
              <h2 className='font-title text-xl font-bold text-primary sm:text-2xl'>{raw.heading}</h2>
            ) : null}
            <div className='mt-3 space-y-3'>
              {paragraphs.map((paragraph, index) => (
                <p key={index} className='font-title text-lg italic leading-relaxed text-primary sm:text-xl'>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </Reveal>
    </SectionShell>
  )
}
