'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountEmptyNote, AccountEmptyState } from '@/features/users/components/account-panel'
import { AccountSectionHeader } from '@/features/users/components/account-shell'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import PreviewImage from '@/shared/components/preview-image'
import { Image01Icon, Mail01Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useEffect, useRef } from 'react'
import { CARD_WRITING_METHOD_LABEL_KEYS, GENERATED_CARD_KIND_LABEL_KEYS } from '../cards/card-labels'
import type { GeneratedCardHistoryEntry } from '../cards/types'
import { useGeneratedCardHistory } from '../hooks/use-generated-card-history'

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
  const {
    generatedCards,
    totalCount,
    isGettingGeneratedCards,
    isGeneratedCardsError,
    isGettingMoreGeneratedCards,
    hasMoreGeneratedCards,
    loadMoreGeneratedCards
  } = useGeneratedCardHistory()

  const sentinelRef = useRef<HTMLDivElement>(null)
  const canLoadMore = hasMoreGeneratedCards && !isGettingMoreGeneratedCards

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreGeneratedCards()
      },
      { rootMargin: '320px 0px' }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [canLoadMore, loadMoreGeneratedCards])

  return (
    <>
      <AccountSectionHeader
        title={t('orders.cards.history.title')}
        description={
          isGettingGeneratedCards
            ? t('orders.cards.history.loading')
            : t('orders.cards.history.count', { count: totalCount })
        }
      />

      {isGettingGeneratedCards ? (
        <CardsLoading />
      ) : isGeneratedCardsError ? (
        <AccountEmptyNote icon={Mail01Icon}>{t('orders.cards.history.error')}</AccountEmptyNote>
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
          <motion.ul initial='hidden' animate='visible' variants={rowStagger} className='grid gap-3'>
            {generatedCards.map((card) => (
              <motion.li key={card.id} variants={rowItem}>
                <GeneratedCardRow card={card} />
              </motion.li>
            ))}
          </motion.ul>

          <div ref={sentinelRef}>
            {isGettingMoreGeneratedCards ? (
              <CardsLoading count={2} />
            ) : hasMoreGeneratedCards ? (
              <div className='flex justify-center pt-1'>
                <Button variant='outline' onClick={() => loadMoreGeneratedCards()}>
                  {t('orders.cards.history.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  )
}

function GeneratedCardRow({ card }: { card: GeneratedCardHistoryEntry }) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const specs = [
    card.sizeName,
    card.sizeWidth && card.sizeHeight
      ? t('orders.cards.history.size', { width: card.sizeWidth, height: card.sizeHeight })
      : '',
    t(CARD_WRITING_METHOD_LABEL_KEYS[card.writingMethod])
  ].filter(Boolean)

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
            {t(GENERATED_CARD_KIND_LABEL_KEYS[card.kind])}
          </h3>
          <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
            {formatDate(card.createdAt, 'dateMedium')}
          </span>
        </header>

        <p className='rounded-2xl bg-secondary/20 px-3 py-2 text-xs leading-relaxed text-foreground/80 ring-1 ring-foreground/5 sm:text-sm'>
          {card.content.message}
        </p>

        <footer className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
          <ul className='flex flex-wrap items-center gap-1'>
            {specs.map((spec) => (
              <li
                key={spec}
                className='rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground'
              >
                {spec}
              </li>
            ))}

            {card.attachedImageUrl ? (
              <li className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground'>
                <HugeiconsIcon icon={Image01Icon} className='size-3 shrink-0' />
                {t('orders.cards.history.attachedImage')}
              </li>
            ) : null}
          </ul>

          {card.totalPrice > 0 ? (
            <span className='shrink-0 text-xs font-semibold text-primary tabular-nums'>
              {formatVnd(card.totalPrice)}
            </span>
          ) : null}
        </footer>
      </div>
    </article>
  )
}

function CardsLoading({ count = 3 }: { count?: number }) {
  return (
    <div className='grid gap-3'>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className='h-36 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
        />
      ))}
    </div>
  )
}
