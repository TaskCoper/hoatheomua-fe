'use client'

import { Button } from '@/components/ui/button'
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
    <li className='py-3 first:pt-0 last:pb-0'>
      <div className='flex items-center gap-3'>
        <OrderCardArtwork
          version={selectedVersion}
          writingMethod={card.writingMethod}
          sizes='64px'
          className='aspect-3/4 w-14 shrink-0 rounded-xl ring-1 ring-primary/10 sm:w-16'
        />

        <div className='min-w-0 flex-1'>
          <p className='text-xs font-semibold text-muted-foreground'>
            {card.quantity > 1 ? `${label} · ${t('orders.cards.quantity', { count: card.quantity })}` : label}
          </p>

          {selectedVersion ? (
            <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/75 italic'>
              “{selectedVersion.content.message}”
            </p>
          ) : (
            <p className='mt-1 text-xs text-muted-foreground'>{t('orders.cards.noVersion')}</p>
          )}
        </div>

        <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
          <DialogTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              aria-label={t('orders.cards.designAriaLabel', { name: card.productName })}
            >
              <HugeiconsIcon icon={PenIcon} strokeWidth={2} className='size-4' />
            </Button>
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
      </div>
    </li>
  )
}
