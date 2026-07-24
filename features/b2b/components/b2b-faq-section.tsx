'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { pick, type OverviewFaq, type OverviewFaqItem } from '@/features/b2b/overview-palette'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import type { Locale } from '@/lib/i18n/routing'
import type { ContactConfigItem } from '@/types/config.type'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

// Answers may embed a single `<zalo>…</zalo>` marker that becomes a Zalo deep-link.
const ZALO_MARKER = /<zalo>([\s\S]*?)<\/zalo>/

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function B2BFaqSection({ faq, locale }: { faq: OverviewFaq; locale: Locale }) {
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const zaloUrl = contactConfigs.find((item) => item.key === 'contact.zalo')?.value.value

  const renderAnswer = (item: OverviewFaqItem): ReactNode => {
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
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-3xl space-y-1 sm:space-y-1.5 md:space-y-2'
      >
        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(faq.title, locale)}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-180 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(faq.description, locale)}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeUp}
        className='mx-auto mt-6 w-full max-w-3xl rounded-3xl bg-card px-5 py-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:px-6'
      >
        <Accordion type='single' collapsible className='w-full'>
          {faq.items.map((item, index) => (
            <AccordionItem key={item.id || index} value={item.id || String(index)}>
              <AccordionTrigger>{pick(item.question, locale)}</AccordionTrigger>
              <AccordionContent>{renderAnswer(item)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
