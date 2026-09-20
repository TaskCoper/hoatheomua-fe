'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { SquareLock02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CARD_WRITING_METHOD_LABEL_KEYS } from '../../cards/card-labels'
import type { CardWritingMethod } from '../../cards/types'

interface OrderCardLockedSpecsProps {
  /** Frozen at checkout, all three: the card was priced on them. */
  sizeName: string
  writingMethod: CardWritingMethod
  minWords: number
  maxWords: number
}

/** What the order settled and the studio cannot touch - the design and the words are elsewhere. */
export default function OrderCardLockedSpecs({
  sizeName,
  writingMethod,
  minWords,
  maxWords
}: OrderCardLockedSpecsProps) {
  const { t } = useTranslation()

  const specs = [
    sizeName || null,
    t(CARD_WRITING_METHOD_LABEL_KEYS[writingMethod]),
    maxWords > 0
      ? minWords > 0
        ? t('orders.cards.locked.wordsRange', { min: minWords, max: maxWords })
        : t('orders.cards.locked.words', { max: maxWords })
      : null
  ].filter(Boolean)

  return (
    <div className='rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
      <p className='flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground'>
        <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} className='size-3.5' />
        {t('orders.cards.locked.heading')}
      </p>

      <p className='mt-1 text-sm font-semibold text-foreground'>{specs.join(' · ')}</p>

      <p className='mt-1 text-[0.7rem] leading-relaxed text-muted-foreground'>{t('orders.cards.locked.note')}</p>
    </div>
  )
}
