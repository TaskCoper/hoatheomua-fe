'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMemo, useState } from 'react'
import {
  DEFAULT_CARD_QUANTITY,
  DEFAULT_CARD_SIZE_ID,
  DEFAULT_CARD_TEMPLATE_ID,
  EMPTY_CARD_CONTENT,
  getCardUnitPrice,
  trimCardContent
} from '../../../cards/card-data'
import type { CardContent, CardSizeId, StandardCheckoutCard } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import CardContentFields from './card-content-fields'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardSizePicker from './card-size-picker'
import CardTemplatePicker from './card-template-picker'

interface StandardCardFormProps {
  initial?: StandardCheckoutCard | null
  onSubmit: (draft: StandardCheckoutCard) => void
  onCancel: () => void
}

export default function StandardCardForm({ initial, onSubmit, onCancel }: StandardCardFormProps) {
  const { t } = useTranslation()

  const [templateId, setTemplateId] = useState(initial?.templateId ?? DEFAULT_CARD_TEMPLATE_ID)
  const [sizeId, setSizeId] = useState<CardSizeId>(initial?.sizeId ?? DEFAULT_CARD_SIZE_ID)
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t), [t])

  const draft: StandardCheckoutCard = {
    type: 'standard',
    templateId,
    sizeId,
    content: trimCardContent(content),
    quantity
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS
  const unitPrice = getCardUnitPrice({ sizeId, messageLength: draft.content.message.length })

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

      <CardSizePicker value={sizeId} onChange={setSizeId} />

      <CardContentFields
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
      />

      <CardFormSummary price={unitPrice * quantity} quantity={{ value: quantity, unitPrice, onChange: setQuantity }} />
    </div>
  )
}
