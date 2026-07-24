'use client'

import { fadeUp, Reveal, SectionShell } from '@/features/b2b/service/components/editorial'
import ServiceImageDivider from '@/features/b2b/service/components/service-image-divider'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import type { Locale } from '@/lib/i18n/routing'
import { motion } from 'motion/react'

export default function ServiceIntroSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const intro = detail.intro.map((paragraph) => pick(paragraph, locale)).filter(Boolean)
  if (intro.length === 0) return null

  const [lead, ...rest] = intro
  const dividerImage = detail.introImage ?? null
  const serviceName = pick(detail.card.name, locale)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        {/* Editorial deck: the lead paragraph reads in the display face. */}
        <motion.p
          variants={fadeUp}
          className='text-justify font-title text-xl leading-normal text-primary sm:text-[1.375rem] sm:leading-normal'
        >
          {lead}
        </motion.p>

        {rest.length > 0 ? (
          <div className='space-y-4'>
            {rest.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeUp}
                className='text-justify text-base leading-relaxed text-foreground/90'
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        ) : null}
      </Reveal>

      {dividerImage ? (
        <div className='mt-8'>
          <ServiceImageDivider src={dividerImage} alt={serviceName} />
        </div>
      ) : null}
    </SectionShell>
  )
}
