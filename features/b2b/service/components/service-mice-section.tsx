'use client'

import type { Locale } from '@/lib/i18n/routing'
import { motion } from 'motion/react'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import { fadeUp, Reveal, SectionHeading, SectionShell } from '@/features/b2b/service/components/editorial'
import ServiceImageSplit from '@/features/b2b/service/components/service-image-split'

export default function ServiceMiceSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const block = detail.mice
  const intro = pick(block?.intro, locale)
  const body = pick(block?.body, locale)
  if (!intro && !body) return null

  const heading = pick(block?.heading, locale)
  const splitImage = block?.image ?? null
  const serviceName = pick(detail.card.name, locale)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        {heading ? <SectionHeading title={heading} /> : null}

        <ServiceImageSplit src={splitImage} alt={serviceName}>
          <div className='space-y-4'>
            {intro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {intro}
              </motion.p>
            ) : null}
            {body ? (
              <motion.blockquote
                variants={fadeUp}
                className='rounded-r-2xl border-l-4 border-leaf bg-leaf/10 py-4 pl-5 pr-5 font-title text-lg italic leading-relaxed text-primary sm:text-xl'
              >
                {body}
              </motion.blockquote>
            ) : null}
          </div>
        </ServiceImageSplit>
      </Reveal>
    </SectionShell>
  )
}
