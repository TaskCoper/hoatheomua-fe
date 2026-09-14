'use client'

import { Button } from '@/components/ui/button'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import {
  DEFAULT_CARD_QUANTITY,
  DEFAULT_CARD_WRITING_METHOD,
  EMPTY_CARD_CONTENT,
  getCardUnitPrice,
  isSameCardContent,
  trimCardContent
} from '../../../cards/card-data'
import { CARD_SIZE_LABEL_KEYS } from '../../../cards/card-labels'
import type { CardContent, CardWritingMethod, GeneratedCard, HistoryCheckoutCard } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import CardContentFields from './card-content-fields'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardHistoryGallery from './card-history-gallery'
import CardWritingPicker from './card-writing-picker'
import CheckoutProductPicker, { isLineOpenForCard, type LineCardCapacities } from './checkout-product-picker'

interface HistoryCardFormProps {
  generatedCards: GeneratedCard[]
  lines: CheckoutSummaryLine[]
  /** How many more cards each line can take, and whether it is already holding AI cards. */
  capacities: LineCardCapacities
  initial?: HistoryCheckoutCard | null
  onSubmit: (draft: HistoryCheckoutCard) => void
  onCancel: () => void
  onCreateFirst: () => void
}

export default function HistoryCardForm({
  generatedCards,
  lines,
  capacities,
  initial,
  onSubmit,
  onCancel,
  onCreateFirst
}: HistoryCardFormProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const openLines = lines.filter((line) => isLineOpenForCard(line, capacities, 'history'))
  const [generatedCardId, setGeneratedCardId] = useState(initial?.generatedCardId ?? '')
  const [lineId, setLineId] = useState(initial?.lineId ?? (openLines.length === 1 ? openLines[0].lineId : ''))
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [writingMethod, setWritingMethod] = useState<CardWritingMethod>(
    initial?.writingMethod ?? DEFAULT_CARD_WRITING_METHOD
  )
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t), [t])

  const selected = generatedCards.find((card) => card.id === generatedCardId) ?? null

  // One card per unit of the product it is printed for, minus the units already carded.
  const attachedLine = lines.find((line) => line.lineId === lineId) ?? null
  const maxQuantity = Math.max(1, capacities.get(lineId)?.remaining ?? DEFAULT_CARD_QUANTITY)

  const draft: HistoryCheckoutCard = {
    type: 'history',
    generatedCardId,
    lineId,
    content: trimCardContent(content),
    writingMethod,
    quantity: Math.min(quantity, maxQuantity)
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS
  const unitPrice = selected
    ? getCardUnitPrice({
        sizeId: selected.sizeId,
        messageLength: draft.content.message.length,
        writingMethod
      })
    : 0

  // A pick only overwrites content copied from another card - anything typed survives.
  const handleSelectGenerated = (nextId: string) => {
    setGeneratedCardId(nextId)
    if (showErrors) setShowErrors(false)

    const next = generatedCards.find((card) => card.id === nextId)
    if (!next) return

    const isUntouched = !selected || isSameCardContent(content, selected.content)
    if (!isUntouched) return

    setContent(next.content)
    setWritingMethod(next.writingMethod)
  }

  // A product with fewer free units holds fewer cards, so moving the card pulls its quantity down.
  const handleSelectLine = (next: string) => {
    setLineId(next)
    if (showErrors) setShowErrors(false)

    const remaining = capacities.get(next)?.remaining
    if (remaining !== undefined) setQuantity((current) => Math.max(1, Math.min(current, remaining)))
  }

  const handleSubmit = () => {
    if (draftIssues.size > 0) {
      setShowErrors(true)
      return
    }

    onSubmit(draft)
  }

  if (generatedCards.length === 0) {
    return (
      <div className='space-y-4'>
        <CardFormHeader type='history' isEditing={!!initial} disabled onSubmit={handleSubmit} onCancel={onCancel} />

        <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center'>
          <span className='grid size-10 place-items-center rounded-full bg-secondary/50 text-primary'>
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} className='size-5' />
          </span>
          <div>
            <p className='text-sm font-medium'>{t('orders.checkout.cards.historyEmptyTitle')}</p>
            <p className='mt-1 text-xs text-muted-foreground'>{t('orders.checkout.cards.historyEmptyBody')}</p>
          </div>
          <Button type='button' variant='outline' size='sm' onClick={onCreateFirst}>
            {t('orders.checkout.cards.historyEmptyAction')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <CardFormHeader
        type='history'
        isEditing={!!initial}
        disabled={openLines.length === 0 && !initial}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />

      <CardHistoryGallery
        generatedCards={generatedCards}
        value={generatedCardId}
        onChange={handleSelectGenerated}
        invalid={issues.has('generatedCardId')}
      />

      {selected ? (
        <div className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3'>
          <PreviewImage
            key={selected.id}
            src={selected.imageUrl}
            alt={t('orders.checkout.cards.previewAlt')}
            sizes='64px'
            className='aspect-[3/4] w-12 shrink-0 rounded-xl border border-border'
          />
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium'>{t(CARD_SIZE_LABEL_KEYS[selected.sizeId])}</p>
            <p className='text-xs text-muted-foreground'>
              {t('orders.checkout.cards.generatedAt', { date: formatDate(selected.createdAt, 'dateShort') })}
            </p>
          </div>
        </div>
      ) : null}

      <CardContentFields
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
      />

      <CardWritingPicker value={writingMethod} onChange={setWritingMethod} />

      <CheckoutProductPicker
        lines={lines}
        value={lineId}
        onChange={handleSelectLine}
        label={t('orders.checkout.cards.attachTo')}
        capacities={capacities}
        cardType='history'
        invalid={issues.has('lineId')}
      />

      <CardFormSummary
        price={unitPrice * draft.quantity}
        quantity={
          selected && attachedLine
            ? { value: draft.quantity, unitPrice, max: maxQuantity, onChange: setQuantity }
            : null
        }
      />
    </div>
  )
}
