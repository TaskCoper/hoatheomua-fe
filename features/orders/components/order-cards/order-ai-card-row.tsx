'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { PenIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { OrderAiCard } from '../../cards/types'
import OrderCardArtwork from './order-card-artwork'
import OrderCardStudioDialog from './order-card-studio-dialog'

interface OrderAiCardRowProps {
  card: OrderAiCard
  /** Where this card sits among the ones printed for the same item. */
  label: string
  /** Designing is a paid-order privilege; elsewhere the row is read-only. */
  canDesign: boolean
}

export default function OrderAiCardRow({ card, label, canDesign }: OrderAiCardRowProps) {
  const { t } = useTranslation()

  const isSettled = !!card.selectedVersionId

  const preview = (
    <>
      <OrderCardArtwork
        imageUrl={card.templateImageUrl || card.rawImageUrl}
        alt={card.templateName || label}
        sizes='56px'
        // A square keeps the list on one rhythm whatever shape the cards are - their real
        // ratio is for the studio, where the artwork is actually being looked at.
        className='aspect-square w-12 shrink-0 rounded-lg ring-1 ring-primary/15'
      />

      <span className='min-w-0 flex-1'>
        <span className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>{label}</span>

        {card.content.message ? (
          <span className='mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground italic'>
            “{card.content.message}”
          </span>
        ) : (
          <span className='mt-0.5 block text-xs text-muted-foreground'>{t('orders.cards.noVersion')}</span>
        )}
      </span>
    </>
  )

  if (card.type === 'handmade' || !canDesign) {
    return <li className='flex w-full items-center gap-2.5 px-2 py-1.5'>{preview}</li>
  }

  return (
    <li>
      <OrderCardStudioDialog card={card}>
        <button
          type='button'
          className='group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-secondary/25 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
          aria-label={
            isSettled
              ? t('orders.cards.final.viewAriaLabel', { name: card.productName })
              : t('orders.cards.designAriaLabel', { name: card.productName })
          }
        >
          {preview}

          <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/40 px-2.5 py-1 text-[0.7rem] font-semibold text-secondary-foreground transition-colors group-hover:bg-secondary/70'>
            <HugeiconsIcon icon={isSettled ? ViewIcon : PenIcon} strokeWidth={2} className='size-3.5 shrink-0' />
            <span className='hidden sm:inline'>
              {isSettled ? t('orders.cards.final.view') : t('orders.cards.design')}
            </span>
          </span>
        </button>
      </OrderCardStudioDialog>
    </li>
  )
}
