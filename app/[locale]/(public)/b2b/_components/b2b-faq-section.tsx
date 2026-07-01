'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { motion, type Variants } from 'motion/react'

const FAQS = [
  {
    id: 'moq',
    questionKey: 'b2b.faq.items.moq.question',
    answerKey: 'b2b.faq.items.moq.answer'
  },
  {
    id: 'contractTerm',
    questionKey: 'b2b.faq.items.contractTerm.question',
    answerKey: 'b2b.faq.items.contractTerm.answer'
  },
  {
    id: 'coverage',
    questionKey: 'b2b.faq.items.coverage.question',
    answerKey: 'b2b.faq.items.coverage.answer'
  },
  {
    id: 'invoicing',
    questionKey: 'b2b.faq.items.invoicing.question',
    answerKey: 'b2b.faq.items.invoicing.answer'
  },
  {
    id: 'flexibility',
    questionKey: 'b2b.faq.items.flexibility.question',
    answerKey: 'b2b.faq.items.flexibility.answer'
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function B2BFaqSection() {
  const { t } = useTranslation()

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
          {t('b2b.faq.title')}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-180 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('b2b.faq.description')}
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
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{t(faq.questionKey)}</AccordionTrigger>
              <AccordionContent>{t(faq.answerKey)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
