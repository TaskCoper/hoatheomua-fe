'use client'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage, type ServiceDetailConfig } from '../_content'
import { cardItem, fadeUp, Reveal, SectionHeading, SectionShell, stagger } from './editorial'
import ServiceImageSplit from './service-image-split'

type PersonalizationBlock = {
  heading?: string
  intro?: string
  subIntro?: string
  items?: Record<string, string>
} | null

export default function ServicePersonalizationSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  let raw: PersonalizationBlock = null
  try {
    raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.personalization`) as PersonalizationBlock
  } catch {
    raw = null
  }
  const items = raw?.items ? Object.values(raw.items) : []
  if (!raw || items.length === 0) return null

  const splitImage = galleryImage(config, 2)
  const serviceName = t(config.cardNameKey)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        {raw.heading ? <SectionHeading title={raw.heading} /> : null}

        <ServiceImageSplit src={splitImage} alt={serviceName} reverse>
          <div className='space-y-4'>
            {raw.intro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {raw.intro}
              </motion.p>
            ) : null}
            {raw.subIntro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {raw.subIntro}
              </motion.p>
            ) : null}

            <motion.ul variants={stagger} className='space-y-2.5 pt-1'>
              {items.map((item, index) => (
                <motion.li key={index} variants={cardItem} className='flex items-start gap-3'>
                  <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full rounded-tl-[0.1875rem] bg-leaf/15 text-leaf'>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
                  </span>
                  <span className='text-sm leading-relaxed text-foreground'>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </ServiceImageSplit>
      </Reveal>
    </SectionShell>
  )
}
