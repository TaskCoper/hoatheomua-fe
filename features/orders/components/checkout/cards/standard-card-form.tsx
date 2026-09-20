'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { getCardMaxWords } from '../../../cards/card-config'
import {
  DEFAULT_CARD_QUANTITY,
  EMPTY_CARD_CONTENT,
  EMPTY_CARD_TEMPLATE,
  readCheckoutCardTemplate,
  toCheckoutCardTemplate,
  trimCardContent
} from '../../../cards/card-data'
import type { CardContent, CheckoutCardTemplate, StandardCheckoutCard } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import { useCardConfig } from '../../../hooks/use-card-config'
import { CARD_TEMPLATE_TYPE_BY_CARD_TYPE, useCardTemplates } from '../../../hooks/use-card-templates'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import CardContentFields from './card-content-fields'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardTemplatePicker from './card-template-picker'
import CheckoutProductPicker, {
  isCardEligibleLine,
  isLineOpenForCard,
  type LineCardCapacities
} from './checkout-product-picker'

interface StandardCardFormProps {
  lines: CheckoutSummaryLine[]
  /** How many more cards each line can take - a free card still occupies one of its units. */
  capacities: LineCardCapacities
  initial?: StandardCheckoutCard | null
  onSubmit: (draft: StandardCheckoutCard) => void
  onCancel: () => void
}

export default function StandardCardForm({ lines, capacities, initial, onSubmit, onCancel }: StandardCardFormProps) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()
  const { templates, isGettingCardTemplates, isGettingMoreCardTemplates, hasMoreCardTemplates, loadMoreCardTemplates } =
    useCardTemplates(CARD_TEMPLATE_TYPE_BY_CARD_TYPE.standard)

  const openLines = lines.filter((line) => isLineOpenForCard(line, capacities, 'standard'))
  const [lineId, setLineId] = useState(initial?.lineId ?? (openLines.length === 1 ? openLines[0].lineId : ''))
  const [templateId, setTemplateId] = useState(initial?.templateId ?? '')
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t, cardConfig), [t, cardConfig])

  // An edited card keeps its own template even when that page of the list is not loaded.
  const picked = templates.find((template) => template.id === templateId)
  const selectedTemplate: CheckoutCardTemplate = picked
    ? toCheckoutCardTemplate(picked)
    : initial?.templateId === templateId
      ? readCheckoutCardTemplate(initial)
      : templates[0]
        ? toCheckoutCardTemplate(templates[0])
        : EMPTY_CARD_TEMPLATE

  // One free card per unit of the product it ships with, minus the units already carded.
  const attachedLine = lines.find((line) => line.lineId === lineId) ?? null
  const maxQuantity = Math.max(1, capacities.get(lineId)?.remaining ?? DEFAULT_CARD_QUANTITY)

  const draft: StandardCheckoutCard = {
    type: 'standard',
    lineId,
    ...selectedTemplate,
    content: trimCardContent(content),
    quantity: Math.min(quantity, maxQuantity)
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS

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

  if (openLines.length === 0 && !initial) {
    const hasEligibleLine = lines.some(isCardEligibleLine)

    return (
      <div className='space-y-4'>
        <CardFormHeader type='standard' isEditing={false} disabled onSubmit={handleSubmit} onCancel={onCancel} />

        <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center'>
          <p className='text-sm font-medium'>{t('orders.checkout.cards.noEligibleProductsTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {hasEligibleLine
              ? t('orders.checkout.cards.allProductsTaken')
              : t('orders.checkout.cards.noEligibleProducts')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <CardFormHeader type='standard' isEditing={!!initial} onSubmit={handleSubmit} onCancel={onCancel} />

      <CheckoutProductPicker
        lines={lines}
        value={lineId}
        onChange={handleSelectLine}
        label={t('orders.checkout.cards.attachTo')}
        capacities={capacities}
        cardType='standard'
        invalid={issues.has('lineId')}
      />

      <CardTemplatePicker
        templates={templates}
        isLoading={isGettingCardTemplates}
        isLoadingMore={isGettingMoreCardTemplates}
        hasMore={hasMoreCardTemplates}
        onLoadMore={() => loadMoreCardTemplates()}
        value={selectedTemplate.templateId}
        onChange={(template) => setTemplateId(template.id)}
      />

      <CardContentFields
        maxWords={getCardMaxWords(cardConfig, null)}
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
      />

      <p className='flex items-start gap-2 text-xs text-muted-foreground'>
        <HugeiconsIcon icon={GiftIcon} strokeWidth={1.75} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {attachedLine
          ? t('orders.checkout.cards.standardFreeNote', {
              name: attachedLine.name || t('orders.checkout.sidebar.unknownProduct'),
              max: maxQuantity
            })
          : t('orders.checkout.cards.standardFreeHint')}
      </p>

      <CardFormSummary
        free
        price={0}
        quantity={
          attachedLine ? { value: draft.quantity, unitPrice: 0, max: maxQuantity, onChange: setQuantity } : null
        }
      />
    </div>
  )
}
