'use client'

import type { Locale } from '@/lib/i18n/routing'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { galleryImage } from '../_content'
import { pick, type B2BServiceDetail } from '../_palette'
import { cardItem, fadeUp, Reveal, SectionHeading, SectionShell, stagger } from './editorial'
import ServiceImageSplit from './service-image-split'

export default function ServicePersonalizationSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const block = detail.personalization
  const items = (block?.items ?? []).map((item) => ({
    title: pick(item.title, locale),
    description: pick(item.description, locale)
  }))
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale)
  const intro = pick(block!.intro, locale)
  const subIntro = pick(block!.subIntro, locale)
  const splitImage = galleryImage(detail, 2)
  const serviceName = pick(detail.card.name, locale)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        {heading ? <SectionHeading title={heading} /> : null}

        <ServiceImageSplit src={splitImage} alt={serviceName} reverse>
          <div className='space-y-4'>
            {intro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {intro}
              </motion.p>
            ) : null}
            {subIntro ? (
              <motion.p variants={fadeUp} className='text-base leading-relaxed text-foreground'>
                {subIntro}
              </motion.p>
            ) : null}

            <motion.ul variants={stagger} className='space-y-2.5 pt-1'>
              {items.map((item, index) => {
                const title = item.description ? item.title : null
                const body = item.description || item.title
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
          </div>
        </ServiceImageSplit>
      </Reveal>
    </SectionShell>
  )
}
