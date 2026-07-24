'use client'

import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/shared/utils'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { pick, type B2BServiceDetail } from '@/features/b2b/service/palette'
import {
  cardItem,
  gridCols,
  petalCard,
  petalCardHover,
  Reveal,
  SectionHeading,
  SectionShell,
  stagger
} from '@/features/b2b/service/components/editorial'
import ServiceImageDivider from '@/features/b2b/service/components/service-image-divider'

export default function ServiceBenefitsSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const block = detail.benefits
  const items = (block?.items ?? []).map((item) => ({
    title: pick(item.title, locale),
    description: pick(item.description, locale)
  }))
  if (items.length === 0) return null

  const heading = pick(block!.heading, locale) || t('b2b.serviceDetails.common.benefitsTitle')
  // Plain when no item carries a description — render as a compact two-column list.
  const allPlain = items.every((item) => !item.description)
  const dividerImage = block?.image ?? null
  const serviceName = pick(detail.card.name, locale)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {allPlain ? (
          <motion.ul variants={stagger} className={cn('grid gap-3', gridCols(items.length, 2))}>
            {items.map((item, index) => (
              <motion.li
                key={index}
                variants={cardItem}
                className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}
              >
                <span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-full rounded-tl-[0.25rem] bg-leaf/15 text-leaf'>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
                </span>
                <span className='pt-0.5 text-sm leading-relaxed text-foreground'>{item.title}</span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div variants={stagger} className={cn('grid gap-4', gridCols(items.length, 3))}>
            {items.map((item, index) => {
              const description = item.description || item.title
              const title = item.description ? item.title : ''
              return (
                <motion.article
                  key={index}
                  variants={cardItem}
                  className={cn(petalCard, petalCardHover, 'group relative flex flex-col gap-3 overflow-hidden p-5')}
                >
                  <span className='flex items-baseline gap-3'>
                    <span className='font-title text-3xl font-bold italic leading-none text-leaf/50 transition-colors group-hover:text-leaf'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden='true' className='h-px flex-1 bg-gradient-to-r from-leaf/30 to-transparent' />
                  </span>
                  <div className='space-y-1.5'>
                    {title ? (
                      <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>{title}</h3>
                    ) : null}
                    <p className='text-sm leading-relaxed text-foreground'>{description}</p>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </Reveal>

      {dividerImage ? (
        <div className='mt-10'>
          <ServiceImageDivider src={dividerImage} alt={serviceName} ratio='aspect-[16/6]' />
        </div>
      ) : null}
    </SectionShell>
  )
}
