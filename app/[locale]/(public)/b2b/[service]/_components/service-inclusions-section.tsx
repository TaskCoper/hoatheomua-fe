'use client'

import type { Locale } from '@/lib/i18n/routing'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage } from '../_content'
import { pick, type B2BServiceDetail } from '../_palette'
import { cardItem, fadeUp, Reveal, SectionHeading, SectionShell, stagger } from './editorial'
import ServiceImageSplit from './service-image-split'

export default function ServiceInclusionsSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.inclusions
  const items = block?.items ?? []
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.inclusionsTitle')
  const subIntro = pick(block!.subIntro, locale)
  const closing = pick(block!.closing, locale)
  const splitImage = galleryImage(detail, 1)
  const serviceName = pick(detail.card.name, locale)

  const checklist = (
    <motion.ul variants={stagger} className='space-y-3'>
      {items.map((item, index) => {
        const title = pick(item.title, locale)
        const description = pick(item.description, locale)
        // Title-only items read as the body line; title + description show the bold lead.
        const heading = description ? title : null
        const body = description || title
        return (
          <motion.li key={index} variants={cardItem} className='flex items-start gap-3'>
            <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full rounded-tl-[0.1875rem] bg-leaf/15 text-leaf'>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
            </span>
            <div className='min-w-0'>
              {heading ? (
                <p className='font-title text-sm font-bold leading-tight text-primary sm:text-base'>{heading}</p>
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

        {subIntro ? (
          <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
            {subIntro}
          </motion.p>
        ) : null}

        <ServiceImageSplit src={splitImage} alt={serviceName} reverse>
          {checklist}
        </ServiceImageSplit>

        {closing ? (
          <motion.p
            variants={fadeUp}
            className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'
          >
            {closing}
          </motion.p>
        ) : null}
      </Reveal>
    </SectionShell>
  )
}
