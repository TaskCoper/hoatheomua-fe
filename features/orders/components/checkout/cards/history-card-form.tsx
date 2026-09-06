'use client'

import { Button } from '@/components/ui/button'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
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
import CardPreviewImage from './card-preview-image'
import CardWritingPicker from './card-writing-picker'
import CheckoutProductPicker, { isCardEligibleLine } from './checkout-product-picker'

interface HistoryCardFormProps {
  generatedCards: GeneratedCard[]
  lines: CheckoutSummaryLine[]
  initial?: HistoryCheckoutCard | null
  onSubmit: (draft: HistoryCheckoutCard) => void
  onCancel: () => void
  onCreateFirst: () => void
}

export default function HistoryCardForm({
  generatedCards,
  lines,
  initial,
  onSubmit,
  onCancel,
  onCreateFirst
}: HistoryCardFormProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const eligibleLines = lines.filter(isCardEligibleLine)
  const [generatedCardId, setGeneratedCardId] = useState(initial?.generatedCardId ?? '')
  const [lineId, setLineId] = useState(initial?.lineId ?? (eligibleLines.length === 1 ? eligibleLines[0].lineId : ''))
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [writingMethod, setWritingMethod] = useState<CardWritingMethod>(
    initial?.writingMethod ?? DEFAULT_CARD_WRITING_METHOD
  )
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t), [t])

  const selected = generatedCards.find((card) => card.id === generatedCardId) ?? null
  const draft: HistoryCheckoutCard = {
    type: 'history',
    generatedCardId,
    lineId,
    content: trimCardContent(content),
    writingMethod,
    quantity
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
        disabled={eligibleLines.length === 0}
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
          <CardPreviewImage
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
        onChange={(next) => {
          setLineId(next)
          if (showErrors) setShowErrors(false)
        }}
        label={t('orders.checkout.cards.attachTo')}
        invalid={issues.has('lineId')}
      />

      <CardFormSummary
        price={unitPrice * quantity}
        quantity={selected ? { value: quantity, unitPrice, onChange: setQuantity } : null}
      />
    </div>
  )
}
