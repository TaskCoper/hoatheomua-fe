'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { PenIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import type { OrderAiCard } from '../../cards/types'
import OrderCardArtwork from './order-card-artwork'
import OrderCardStudio from './order-card-studio'

interface OrderAiCardRowProps {
  card: OrderAiCard
  /** Where this card sits among the ones printed for the same item. */
  label: string
  /** Designing is a paid-order privilege; elsewhere the row is read-only. */
  canDesign: boolean
}

export default function OrderAiCardRow({ card, label, canDesign }: OrderAiCardRowProps) {
  const { t } = useTranslation()
  const [isStudioOpen, setIsStudioOpen] = useState(false)

  // The generated artworks belong to the open studio, so the row stays on what the order
  // froze: the design that was picked and the words that were paid for.
  const preview = (
    <>
      <OrderCardArtwork
        imageUrl={card.templateImageUrl}
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

  // A handmade card is written by the florist - there is nothing to design, so the row is
  // a plain line rather than a dead button. An unpaid order reads the same way: the design
  // that was ordered is on show, but the studio only opens once the order is paid.
  if (card.type === 'handmade' || !canDesign) {
    return <li className='flex w-full items-center gap-2.5 px-2 py-1.5'>{preview}</li>
  }

  return (
    <li>
      <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
        {/* The whole row opens the studio - the pen is the hint, not the only target. */}
        <DialogTrigger asChild>
          <button
            type='button'
            className='group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-secondary/25 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
            aria-label={t('orders.cards.designAriaLabel', { name: card.productName })}
          >
            {preview}

            <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/40 px-2.5 py-1 text-[0.7rem] font-semibold text-secondary-foreground transition-colors group-hover:bg-secondary/70'>
              <HugeiconsIcon icon={PenIcon} strokeWidth={2} className='size-3.5 shrink-0' />
              <span className='hidden sm:inline'>{t('orders.cards.design')}</span>
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl' position='top-center'>
          {/* Mounted only while open, so the card's generations are asked for on the click. */}
          {isStudioOpen ? (
            <OrderCardStudio card={card} isOpen={isStudioOpen} onDone={() => setIsStudioOpen(false)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </li>
  )
}
