'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountEmptyNote, AccountEmptyState, AccountFilterTabs } from '@/features/users/components/account-panel'
import { AccountSectionHeader } from '@/features/users/components/account-shell'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import PreviewImage from '@/shared/components/preview-image'
import { Mail01Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useMemo, useState } from 'react'
import { CARD_WRITING_METHOD_LABEL_KEYS } from '../cards/card-labels'
import type { CardWritingMethod, GeneratedCard } from '../cards/types'
import { useGeneratedCards } from '../hooks/use-generated-cards'

const ALL = 'all'

type WritingFilter = typeof ALL | CardWritingMethod

const WRITING_FILTERS: CardWritingMethod[] = ['typed', 'handwritten']

const rowStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } }
}

const rowItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 170, damping: 19 } }
}

export default function AccountCardGenerations() {
  const { t } = useTranslation()
  const { generatedCards, isLoadingGeneratedCards } = useGeneratedCards()

  const [writing, setWriting] = useState<WritingFilter>(ALL)

  const options = useMemo(
    () => [
      { value: ALL as WritingFilter, label: t('orders.cards.history.filterAll'), count: generatedCards.length },
      ...WRITING_FILTERS.map((method) => ({
        value: method as WritingFilter,
        label: t(CARD_WRITING_METHOD_LABEL_KEYS[method]),
        count: generatedCards.filter((card) => card.writingMethod === method).length
      }))
    ],
    [generatedCards, t]
  )

  const visible = writing === ALL ? generatedCards : generatedCards.filter((card) => card.writingMethod === writing)

  return (
    <>
      <AccountSectionHeader
        title={t('orders.cards.history.title')}
        description={
          isLoadingGeneratedCards
            ? t('orders.cards.history.loading')
            : t('orders.cards.history.count', { count: generatedCards.length })
        }
      />

      {isLoadingGeneratedCards ? (
        <CardsLoading />
      ) : generatedCards.length === 0 ? (
        <AccountEmptyState
          icon={Mail01Icon}
          title={t('orders.cards.history.empty.title')}
          description={t('orders.cards.history.empty.description')}
          action={
            <Button asChild size='lg' className='mt-2'>
              <Link href='/cart'>
                <HugeiconsIcon icon={ShoppingCart01Icon} className='size-4' />
                {t('orders.cards.history.empty.cta')}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <AccountFilterTabs
            value={writing}
            options={options}
            onChange={setWriting}
            ariaLabel={t('orders.cards.history.filterLabel')}
          />

          {visible.length === 0 ? (
            <AccountEmptyNote icon={Mail01Icon}>{t('orders.cards.history.emptyFilter')}</AccountEmptyNote>
          ) : (
            /* Keyed on the filter so switching replays the stagger. */
            <motion.ul key={writing} initial='hidden' animate='visible' variants={rowStagger} className='grid gap-3'>
              {visible.map((card) => (
                <motion.li key={card.id} variants={rowItem}>
                  <GeneratedCardRow card={card} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </>
      )}
    </>
  )
}

function GeneratedCardRow({ card }: { card: GeneratedCard }) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const specs = [card.sizeName, t(CARD_WRITING_METHOD_LABEL_KEYS[card.writingMethod])].filter(Boolean)

  return (
    <article className='flex gap-3 rounded-3xl bg-card p-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_1rem_2.4rem_rgb(81_108_108/12%)]'>
      <PreviewImage
        src={card.imageUrl}
        alt={t('orders.checkout.cards.previewAlt')}
        sizes='(min-width: 640px) 6rem, 5rem'
        className='aspect-3/4 w-20 shrink-0 rounded-2xl ring-1 ring-foreground/5 sm:w-24'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <header className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5'>
          <h3 className='min-w-0 wrap-break-word font-title text-sm font-bold text-primary sm:text-base'>
            {card.templateName || t('orders.checkout.cards.tabs.ai')}
          </h3>
          <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
            {formatDate(card.createdAt, 'dateMedium')}
          </span>
        </header>

        <p className='rounded-2xl bg-secondary/20 px-3 py-2 text-xs leading-relaxed text-foreground/80 ring-1 ring-foreground/5 sm:text-sm'>
          {card.content.message}
        </p>

        <footer>
          <ul className='flex flex-wrap items-center gap-1'>
            {specs.map((spec) => (
              <li
                key={spec}
                className='rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground'
              >
                {spec}
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </article>
  )
}

function CardsLoading() {
  return (
    <div className='grid gap-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton
          key={index}
          className='h-36 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
        />
      ))}
    </div>
  )
}
