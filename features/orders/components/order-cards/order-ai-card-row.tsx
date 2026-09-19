'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { PenIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { getSelectedOrderCardVersion } from '../../cards/order-card-data'
import type { CardWritingMethod, OrderAiCard, OrderCardVersion } from '../../cards/types'
import OrderCardArtwork from './order-card-artwork'
import OrderCardStudio from './order-card-studio'

interface OrderAiCardRowProps {
  card: OrderAiCard
  /** Where this card sits among the ones printed for the same item. */
  label: string
  onAddVersion: (cardId: string, version: OrderCardVersion) => void
  onApplyVersion: (cardId: string, args: { versionId: string; writingMethod: CardWritingMethod }) => void
}

export default function OrderAiCardRow({ card, label, onAddVersion, onApplyVersion }: OrderAiCardRowProps) {
  const { t } = useTranslation()
  const [isStudioOpen, setIsStudioOpen] = useState(false)

  const selectedVersion = getSelectedOrderCardVersion(card)

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
            <OrderCardArtwork
              version={selectedVersion}
              writingMethod={card.writingMethod}
              sizes='56px'
              className='aspect-3/4 w-12 shrink-0 rounded-lg ring-1 ring-primary/15'
            />

            <span className='min-w-0 flex-1'>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
                {label}
                {card.quantity > 1 ? (
                  <span className='rounded-full bg-secondary/40 px-1.5 py-px text-[0.65rem] font-semibold text-secondary-foreground'>
                    {t('orders.cards.quantity', { count: card.quantity })}
                  </span>
                ) : null}
              </span>

              {selectedVersion ? (
                <span className='mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground italic'>
                  “{selectedVersion.content.message}”
                </span>
              ) : (
                <span className='mt-0.5 block text-xs text-muted-foreground'>{t('orders.cards.noVersion')}</span>
              )}
            </span>

            <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/40 px-2.5 py-1 text-[0.7rem] font-semibold text-secondary-foreground transition-colors group-hover:bg-secondary/70'>
              <HugeiconsIcon icon={PenIcon} strokeWidth={2} className='size-3.5 shrink-0' />
              <span className='hidden sm:inline'>{t('orders.cards.design')}</span>
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl' position='top-center'>
          <OrderCardStudio
            card={card}
            onAddVersion={onAddVersion}
            onApplyVersion={onApplyVersion}
            onDone={() => setIsStudioOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </li>
  )
}
