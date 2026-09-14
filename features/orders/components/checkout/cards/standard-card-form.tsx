'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import {
  DEFAULT_CARD_QUANTITY,
  DEFAULT_CARD_TEMPLATE_ID,
  EMPTY_CARD_CONTENT,
  trimCardContent
} from '../../../cards/card-data'
import type { CardContent, StandardCheckoutCard } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import CardContentFields from './card-content-fields'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardTemplatePicker from './card-template-picker'

interface StandardCardFormProps {
  /** Free cards left in the order's allowance, this card's own quantity included. */
  maxQuantity: number
  initial?: StandardCheckoutCard | null
  onSubmit: (draft: StandardCheckoutCard) => void
  onCancel: () => void
}

export default function StandardCardForm({ maxQuantity, initial, onSubmit, onCancel }: StandardCardFormProps) {
  const { t } = useTranslation()

  const [templateId, setTemplateId] = useState(initial?.templateId ?? DEFAULT_CARD_TEMPLATE_ID)
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [quantity, setQuantity] = useState(Math.min(initial?.quantity ?? DEFAULT_CARD_QUANTITY, maxQuantity))
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t), [t])

  const draft: StandardCheckoutCard = {
    type: 'standard',
    templateId,
    content: trimCardContent(content),
    quantity
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS

  const handleSubmit = () => {
    if (draftIssues.size > 0) {
      setShowErrors(true)
      return
    }

    onSubmit(draft)
  }

  return (
    <div className='space-y-4'>
      <CardFormHeader type='standard' isEditing={!!initial} onSubmit={handleSubmit} onCancel={onCancel} />

      <CardTemplatePicker value={templateId} onChange={setTemplateId} />

      <CardContentFields
        showSurcharge={false}
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
      />

      <p className='flex items-start gap-2 text-xs text-muted-foreground'>
        <HugeiconsIcon icon={GiftIcon} strokeWidth={1.75} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('orders.checkout.cards.standardFreeNote', { max: maxQuantity })}
      </p>

      <CardFormSummary
        free
        price={0}
        quantity={{ value: quantity, unitPrice: 0, max: maxQuantity, onChange: setQuantity }}
      />
    </div>
  )
}
