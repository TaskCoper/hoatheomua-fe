'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import {
  DEFAULT_CARD_QUANTITY,
  DEFAULT_CARD_SIZE_ID,
  DEFAULT_CARD_TEMPLATE_ID,
  DEFAULT_CARD_WRITING_METHOD,
  EMPTY_CARD_CONTENT,
  getCardUnitPrice,
  trimCardContent
} from '../../../cards/card-data'
import type { AiCheckoutCard, CardContent, CardSizeId, CardWritingMethod } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import CardContentFields from './card-content-fields'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardSizePicker from './card-size-picker'
import CardTemplatePicker from './card-template-picker'
import CardWritingPicker from './card-writing-picker'
import CheckoutProductPicker, { isCardEligibleLine } from './checkout-product-picker'

interface AiCardFormProps {
  lines: CheckoutSummaryLine[]
  initial?: AiCheckoutCard | null
  onSubmit: (draft: AiCheckoutCard) => void
  onCancel: () => void
}

export default function AiCardForm({ lines, initial, onSubmit, onCancel }: AiCardFormProps) {
  const { t } = useTranslation()

  const eligibleLines = lines.filter(isCardEligibleLine)
  const [lineId, setLineId] = useState(initial?.lineId ?? (eligibleLines.length === 1 ? eligibleLines[0].lineId : ''))
  const [templateId, setTemplateId] = useState(initial?.templateId ?? DEFAULT_CARD_TEMPLATE_ID)
  const [sizeId, setSizeId] = useState<CardSizeId>(initial?.sizeId ?? DEFAULT_CARD_SIZE_ID)
  const [writingMethod, setWritingMethod] = useState<CardWritingMethod>(
    initial?.writingMethod ?? DEFAULT_CARD_WRITING_METHOD
  )
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t), [t])

  const draft: AiCheckoutCard = {
    type: 'ai',
    lineId,
    templateId,
    sizeId,
    writingMethod,
    content: trimCardContent(content),
    quantity
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS
  const unitPrice = getCardUnitPrice({ sizeId, messageLength: draft.content.message.length, writingMethod })

  const handleSubmit = () => {
    if (draftIssues.size > 0) {
      setShowErrors(true)
      return
    }

    onSubmit(draft)
  }

  if (eligibleLines.length === 0) {
    return (
      <div className='space-y-4'>
        <CardFormHeader type='ai' isEditing={!!initial} disabled onSubmit={handleSubmit} onCancel={onCancel} />

        <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center'>
          <p className='text-sm font-medium'>{t('orders.checkout.cards.noEligibleProductsTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('orders.checkout.cards.noEligibleProducts')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <CardFormHeader type='ai' isEditing={!!initial} onSubmit={handleSubmit} onCancel={onCancel} />

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

      <CardTemplatePicker value={templateId} onChange={setTemplateId} />

      <CardSizePicker value={sizeId} onChange={setSizeId} />

      <CardContentFields
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
      />

      <CardWritingPicker value={writingMethod} onChange={setWritingMethod} />

      <p className='flex items-start gap-2 text-xs text-muted-foreground'>
        <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.75} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('orders.checkout.cards.aiPendingNote')}
      </p>

      <CardFormSummary price={unitPrice * quantity} quantity={{ value: quantity, unitPrice, onChange: setQuantity }} />
    </div>
  )
}
