'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/shared/utils'
import type { ContactConfigItem } from '@/types/config.type'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { pick, type B2BServiceDetail, type FaqItem } from '@/features/b2b/service/palette'
import { petalCard, Reveal, SectionHeading } from '@/features/b2b/service/components/editorial'
import ServiceImageDivider from '@/features/b2b/service/components/service-image-divider'

// Answers may embed a single `<zalo>…</zalo>` marker that becomes a Zalo deep-link.
const ZALO_MARKER = /<zalo>([\s\S]*?)<\/zalo>/

export default function ServiceFaqSection({
  detail,
  locale,
  id
}: {
  detail: B2BServiceDetail
  locale: Locale
  id: string
}) {
  const t = useTranslations()
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const zaloUrl = contactConfigs.find((item) => item.key === 'contact.zalo')?.value.value

  const items = detail.faq?.items ?? []
  if (items.length === 0) return null

  const heading = pick(detail.faq!.heading, locale) || t('b2b.serviceDetails.common.faqTitle')
  const dividerImage = detail.faq?.image ?? null
  const serviceName = pick(detail.card.name, locale)

  const renderAnswer = (item: FaqItem): ReactNode => {
    const answer = pick(item.answer, locale)
    if (!item.hasZalo) return answer

    const match = answer.match(ZALO_MARKER)
    if (!match) return answer

    const [full, label] = match
    const start = match.index ?? 0
    const before = answer.slice(0, start)
    const after = answer.slice(start + full.length)
    return (
      <>
        {before}
        {zaloUrl ? (
          <a
            href={zaloUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-primary underline underline-offset-2 hover:text-primary/80'
          >
            {label}
          </a>
        ) : (
          <span className='font-semibold text-primary'>{label}</span>
        )}
        {after}
      </>
    )
  }

  return (
    <section id={id} className='scroll-mt-28'>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        <div className={cn(petalCard, 'px-5 py-1 sm:px-6')}>
          <Accordion type='single' collapsible className='w-full'>
            {items.map((item, index) => (
              <AccordionItem key={index} value={String(index)}>
                <AccordionTrigger>{pick(item.question, locale)}</AccordionTrigger>
                <AccordionContent>{renderAnswer(item)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {dividerImage ? <ServiceImageDivider src={dividerImage} alt={serviceName} /> : null}
      </Reveal>
    </section>
  )
}
