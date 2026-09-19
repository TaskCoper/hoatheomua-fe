'use client'

import { Button } from '@/components/ui/button'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { findCardTemplate, getCheckoutCardPrice } from '../../../cards/card-data'
import { CARD_SIZE_LABEL_KEYS, CARD_WRITING_METHOD_LABEL_KEYS } from '../../../cards/card-labels'
import type { CheckoutCardField, GeneratedCard } from '../../../cards/types'
import type { CheckoutSummaryLine } from '../checkout-sidebar'

interface CheckoutCardListProps {
  cards: CheckoutCardField[]
  generatedCards: GeneratedCard[]
  lines: CheckoutSummaryLine[]
  onEdit: (card: CheckoutCardField, index: number) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

export default function CheckoutCardList({
  cards,
  generatedCards,
  lines,
  onEdit,
  onRemove,
  readOnly
}: CheckoutCardListProps) {
  return (
    <ul className='divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50'>
      {cards.map((card, index) => (
        <CheckoutCardListItem
          key={card.id}
          card={card}
          generatedCards={generatedCards}
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
  generatedCards,
  lines,
  onEdit,
  onRemove,
  readOnly
}: {
  card: CheckoutCardField
  generatedCards: GeneratedCard[]
  lines: CheckoutSummaryLine[]
  onEdit: () => void
  onRemove: () => void
  readOnly?: boolean
}) {
  const { t } = useTranslation()

  const generated =
    card.type === 'history' ? (generatedCards.find((item) => item.id === card.generatedCardId) ?? null) : null

  const templateId = card.type === 'history' ? generated?.templateId : card.templateId
  // The standard card is free, so it has no size to show.
  const sizeId = card.type === 'standard' ? null : card.type === 'history' ? generated?.sizeId : card.sizeId
  const writingMethod = card.type === 'standard' ? null : card.writingMethod
  const content = card.content

  const template = templateId ? findCardTemplate(templateId) : null
  const attachedLine = lines.find((line) => line.lineId === card.lineId) ?? null

  const title =
    card.type === 'standard'
      ? t('orders.checkout.cards.tabs.standard')
      : card.type === 'ai'
        ? t('orders.checkout.cards.tabs.ai')
        : t('orders.checkout.cards.reusedTitle')

  const meta = [
    template ? t('orders.checkout.cards.templateName', { name: template.name }) : null,
    sizeId ? t(CARD_SIZE_LABEL_KEYS[sizeId]) : null,
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
        src={generated?.imageUrl ?? template?.imageUrl ?? null}
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
                : formatVnd(getCheckoutCardPrice(card, generatedCards))}
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
