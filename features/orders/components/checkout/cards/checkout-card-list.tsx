'use client'

import { Button } from '@/components/ui/button'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getCheckoutCardPrice } from '../../../cards/card-data'
import { CARD_WRITING_METHOD_LABEL_KEYS } from '../../../cards/card-labels'
import type { CheckoutCardField } from '../../../cards/types'
import { useCardConfig } from '../../../hooks/use-card-config'
import { useObjectUrl } from '../../../hooks/use-object-url'
import type { CheckoutSummaryLine } from '../checkout-sidebar'

interface CheckoutCardListProps {
  cards: CheckoutCardField[]
  lines: CheckoutSummaryLine[]
  onEdit: (card: CheckoutCardField, index: number) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

export default function CheckoutCardList({ cards, lines, onEdit, onRemove, readOnly }: CheckoutCardListProps) {
  return (
    <ul className='divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50'>
      {cards.map((card, index) => (
        <CheckoutCardListItem
          key={card.id}
          card={card}
          lines={lines}
          onEdit={() => onEdit(card, index)}
          onRemove={() => onRemove(index)}
          readOnly={readOnly}
        />
      ))}
    </ul>
  )
}

function CheckoutCardListItem({
  card,
  lines,
  onEdit,
  onRemove,
  readOnly
}: {
  card: CheckoutCardField
  lines: CheckoutSummaryLine[]
  onEdit: () => void
  onRemove: () => void
  readOnly?: boolean
}) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()

  // A reused card carries its own snapshot of the generation it was picked from.
  const templateName = card.templateName
  const artwork = card.type === 'history' ? card.imageUrl : card.templateImageUrl
  // The standard card is free, so it has no size to show.
  const sizeName = card.type === 'standard' ? null : card.sizeName
  const writingMethod = card.type === 'standard' ? null : card.writingMethod
  const content = card.content

  const attachedLine = lines.find((line) => line.lineId === card.lineId) ?? null

  const title =
    card.type === 'standard'
      ? t('orders.checkout.cards.tabs.standard')
      : card.type === 'ai'
        ? t('orders.checkout.cards.tabs.ai')
        : t('orders.checkout.cards.reusedTitle')

  const meta = [
    templateName ? t('orders.checkout.cards.templateName', { name: templateName }) : null,
    sizeName || null,
    writingMethod ? t(CARD_WRITING_METHOD_LABEL_KEYS[writingMethod]) : null
  ]
    .filter(Boolean)
    .join(' · ')

  const attachment = t('orders.checkout.cards.attachedTo', {
    name: attachedLine?.name || t('orders.checkout.sidebar.unknownProduct')
  })

  return (
    <li className='flex items-start gap-3 p-3'>
      <PreviewImage
        src={artwork || null}
        alt={title}
        sizes='64px'
        className='aspect-3/4 w-14 shrink-0 rounded-xl border border-border'
      />

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium leading-5'>{title}</p>
            <p className='truncate text-xs text-muted-foreground'>{meta}</p>
          </div>
          <div className='shrink-0 text-right'>
            <p className='text-sm font-semibold leading-5 tabular-nums text-primary'>
              {card.type === 'standard'
                ? t('orders.checkout.cards.free')
                : formatVnd(getCheckoutCardPrice(card, cardConfig))}
            </p>
            {card.quantity > 1 ? (
              <p className='text-xs tabular-nums text-muted-foreground'>
                {t('orders.checkout.lineQtyOnly', { qty: card.quantity })}
              </p>
            ) : null}
          </div>
        </div>

        {/* The product this card is printed for, shown with its photo so the pairing is unmistakable. */}
        <div className='mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground'>
          <PreviewImage
            src={attachedLine?.image ?? null}
            alt=''
            sizes='20px'
            className='size-5 shrink-0 rounded-md border border-border'
          />
          <span className='truncate'>{attachment}</span>
        </div>

        {content.message ? (
          <p className='truncate text-xs italic text-muted-foreground'>“{content.message}”</p>
        ) : card.type === 'ai' ? (
          <p className='truncate text-xs text-muted-foreground'>{t('orders.checkout.cards.aiPendingShort')}</p>
        ) : null}

        {card.type === 'ai' && card.attachedImage ? <CardAttachmentPreview file={card.attachedImage} /> : null}
      </div>

      {!readOnly ? (
        <div className='flex shrink-0 flex-col gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='rounded-full text-muted-foreground'
            onClick={onEdit}
            aria-label={t('orders.checkout.cards.edit')}
          >
            <HugeiconsIcon icon={Edit02Icon} className='size-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
            onClick={onRemove}
            aria-label={t('orders.checkout.cards.remove')}
          >
            <HugeiconsIcon icon={Delete02Icon} className='size-4' />
          </Button>
        </div>
      ) : null}
    </li>
  )
}

function CardAttachmentPreview({ file }: { file: File }) {
  const { t } = useTranslation()
  const previewUrl = useObjectUrl(file)

  return (
    <div className='mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground'>
      <PreviewImage
        src={previewUrl}
        alt={t('orders.checkout.cards.attachment')}
        sizes='20px'
        unoptimized
        className='size-5 shrink-0 rounded-md border border-border'
      />
      <span className='truncate'>{file.name}</span>
    </div>
  )
}
