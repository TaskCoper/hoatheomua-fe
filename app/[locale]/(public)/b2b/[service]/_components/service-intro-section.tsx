'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage, type ServiceDetailConfig } from '../_content'
import { fadeUp, Reveal, SectionShell } from './editorial'
import ServiceImageDivider from './service-image-divider'

export default function ServiceIntroSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  const raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.intro`) as Record<string, string> | null
  const intro = raw ? Object.values(raw) : []
  if (intro.length === 0) return null

  const [lead, ...rest] = intro
  const dividerImage = galleryImage(config, 0)
  const serviceName = t(config.cardNameKey)

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
