'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import type { ContactConfigItem } from '@/types/config.type'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import type { ServiceI18nKey } from '../_content'
import { petalCard, Reveal, SectionHeading } from './editorial'

type FaqItem = { question: string; answer: string; hasZalo?: boolean }

type FaqBlock = {
  heading?: string
  items?: Record<string, FaqItem>
} | null

export default function ServiceFaqSection({ serviceKey, id }: { serviceKey: ServiceI18nKey; id: string }) {
  const { t } = useTranslation()
  const rt = useTranslations()
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const zaloUrl = contactConfigs.find((item) => item.key === 'contact.zalo')?.value.value

  let raw: FaqBlock = null
  try {
    raw = rt.raw(`b2b.serviceDetails.${serviceKey}.faq`) as FaqBlock
  } catch {
    raw = null
  }
  const entries = raw?.items ? Object.entries(raw.items) : []
  if (entries.length === 0) return null

  const heading = raw?.heading ?? t('b2b.serviceDetails.common.faqTitle')

  const renderAnswer = (key: string, item: FaqItem): ReactNode => {
    if (!item.hasZalo) return item.answer
    return rt.rich(`b2b.serviceDetails.${serviceKey}.faq.items.${key}.answer`, {
      zalo: (chunks) =>
        zaloUrl ? (
          <a
            href={zaloUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-primary underline underline-offset-2 hover:text-primary/80'
          >
            {chunks}
          </a>
        ) : (
          <span className='font-semibold text-primary'>{chunks}</span>
        )
    })
  }

  return (
    <section id={id} className='scroll-mt-28'>
      <Reveal className='space-y-6'>
        <SectionHeading title={heading} />

        <div className={cn(petalCard, 'px-5 py-1 sm:px-6')}>
          <Accordion type='single' collapsible className='w-full'>
            {entries.map(([key, item]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{renderAnswer(key, item)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  )
}
