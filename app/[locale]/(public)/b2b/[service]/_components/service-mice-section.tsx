'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage, type ServiceDetailConfig } from '../_content'
import { fadeUp, Reveal, SectionHeading, SectionShell } from './editorial'
import ServiceImageSplit from './service-image-split'

type MiceBlock = {
  heading?: string
  intro?: string
  body?: string
} | null

export default function ServiceMiceSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  let raw: MiceBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.mice`) as MiceBlock
  } catch {
    raw = null
  }
  if (!raw || (!raw.intro && !raw.body)) return null

  const splitImage = galleryImage(config, 2)
  const serviceName = t(config.cardNameKey)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        {raw.heading ? <SectionHeading title={raw.heading} /> : null}

        <ServiceImageSplit src={splitImage} alt={serviceName}>
          <div className='space-y-4'>
            {raw.intro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {raw.intro}
              </motion.p>
            ) : null}
            {raw.body ? (
              <motion.blockquote
                variants={fadeUp}
                className='rounded-r-2xl border-l-4 border-leaf bg-leaf/10 py-4 pl-5 pr-5 font-title text-lg italic leading-relaxed text-primary sm:text-xl'
              >
                {raw.body}
              </motion.blockquote>
            ) : null}
          </div>
        </ServiceImageSplit>
      </Reveal>
    </SectionShell>
  )
}
