'use client'

import { cn } from '@/shared/utils'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { galleryImage, type ServiceDetailConfig } from '../_content'
import { cardItem, petalCard, petalCardHover, Reveal, SectionHeading, SectionShell, stagger } from './editorial'
import ServiceImageDivider from './service-image-divider'

type BenefitItem = string | { title: string; description: string }

type BenefitsBlock = {
  heading?: string
  items?: Record<string, BenefitItem>
} | null

export default function ServiceBenefitsSection({ config, id }: { config: ServiceDetailConfig; id: string }) {
  const t = useTranslations()
  const raw = t.raw(`b2b.serviceDetails.${config.i18nKey}.benefits`) as BenefitsBlock
  const items = raw?.items ? Object.values(raw.items) : []
  if (items.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.benefitsTitle')
  const allPlain = items.every((item) => typeof item === 'string')
  const dividerImage = galleryImage(config, 3)
  const serviceName = t(config.cardNameKey)

  return (
    <SectionShell id={id}>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        {allPlain ? (
          <motion.ul variants={stagger} className='grid gap-3 sm:grid-cols-2'>
            {(items as string[]).map((item, index) => (
              <motion.li
                key={index}
                variants={cardItem}
                className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}
              >
                <span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-full rounded-tl-[0.25rem] bg-leaf/15 text-leaf'>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
                </span>
                <span className='pt-0.5 text-sm leading-relaxed text-foreground'>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div variants={stagger} className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {items.map((item, index) => {
              const title = typeof item === 'string' ? '' : item.title
              const description = typeof item === 'string' ? item : item.description
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
