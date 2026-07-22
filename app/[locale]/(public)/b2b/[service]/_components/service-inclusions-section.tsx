'use client'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage, type ServiceDetailConfig } from '../_content'
import { cardItem, fadeUp, Reveal, SectionHeading, SectionShell, stagger } from './editorial'
import ServiceImageSplit from './service-image-split'

type InclusionItem = string | { title: string; description: string }

type InclusionsBlock = {
  heading?: string
  subIntro?: string
  items?: Record<string, InclusionItem>
  closing?: string
} | null

export default function ServiceInclusionsSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  const raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.inclusions`) as InclusionsBlock
  const items = raw?.items ? Object.values(raw.items) : []

  if (items.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.inclusionsTitle')
  const splitImage = galleryImage(config, 1)
  const serviceName = t(config.cardNameKey)

  const checklist = (
    <motion.ul variants={stagger} className='space-y-3'>
      {items.map((item, index) => {
        const isDetailed = typeof item !== 'string'
        const title = isDetailed ? item.title : null
        const body = isDetailed ? item.description : item
        return (
          <motion.li key={index} variants={cardItem} className='flex items-start gap-3'>
            <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full rounded-tl-[0.1875rem] bg-leaf/15 text-leaf'>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
            </span>
            <div className='min-w-0'>
              {title ? (
                <p className='font-title text-sm font-bold leading-tight text-primary sm:text-base'>{title}</p>
              ) : null}
              <span className='text-sm leading-relaxed text-foreground'>{body}</span>
            </div>
          </motion.li>
        )
      })}
    </motion.ul>
  )

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {raw?.subIntro ? (
          <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
            {raw.subIntro}
          </motion.p>
        ) : null}

        <ServiceImageSplit src={splitImage} alt={serviceName} reverse>
          {checklist}
        </ServiceImageSplit>

        {raw?.closing ? (
          <motion.p
            variants={fadeUp}
            className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'
          >
            {raw.closing}
          </motion.p>
        ) : null}
      </Reveal>
    </SectionShell>
  )
}
