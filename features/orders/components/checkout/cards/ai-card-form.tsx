'use client'

import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import {
  countWords,
  findCardSize,
  getCardHandwritingPrice,
  getCardMaxWords,
  getCardUnitPrice,
  getDefaultCardSizeName
} from '../../../cards/card-config'
import {
  DEFAULT_CARD_QUANTITY,
  DEFAULT_CARD_WRITING_METHOD,
  EMPTY_CARD_CONTENT,
  EMPTY_CARD_TEMPLATE,
  readCheckoutCardTemplate,
  toCheckoutCardTemplate,
  trimCardContent
} from '../../../cards/card-data'
import type { AiCheckoutCard, CardContent, CardWritingMethod, CheckoutCardTemplate } from '../../../cards/types'
import { createCheckoutCardSchema, EMPTY_ISSUE_PATHS, getCardIssuePaths } from '../../../cards/validations'
import { useCardConfig } from '../../../hooks/use-card-config'
import { CARD_TEMPLATE_TYPE_BY_CARD_TYPE, useCardTemplates } from '../../../hooks/use-card-templates'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import CardAttachmentField from './card-attachment-field'
import CardContentFields from './card-content-fields'
import CardFormActions from './card-form-actions'
import CardFormHeader from './card-form-header'
import CardFormSummary from './card-form-summary'
import CardSizePicker from './card-size-picker'
import CardTemplatePicker from './card-template-picker'
import CardWritingPicker from './card-writing-picker'
import CheckoutProductPicker, {
  isCardEligibleLine,
  isLineOpenForCard,
  type LineCardCapacities
} from './checkout-product-picker'

interface AiCardFormProps {
  lines: CheckoutSummaryLine[]
  /** How many more cards each line can take, and whether it is already holding history cards. */
  capacities: LineCardCapacities
  initial?: AiCheckoutCard | null
  onSubmit: (draft: AiCheckoutCard) => void
  onCancel: () => void
}

export default function AiCardForm({ lines, capacities, initial, onSubmit, onCancel }: AiCardFormProps) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()
  const { templates, isGettingCardTemplates, isGettingMoreCardTemplates, hasMoreCardTemplates, loadMoreCardTemplates } =
    useCardTemplates(CARD_TEMPLATE_TYPE_BY_CARD_TYPE.ai)

  const openLines = lines.filter((line) => isLineOpenForCard(line, capacities, 'ai'))
  const [lineId, setLineId] = useState(initial?.lineId ?? (openLines.length === 1 ? openLines[0].lineId : ''))
  const [templateId, setTemplateId] = useState(initial?.templateId ?? '')
  const [sizeName, setSizeName] = useState(initial?.sizeName ?? '')
  const [writingMethod, setWritingMethod] = useState<CardWritingMethod>(
    initial?.writingMethod ?? DEFAULT_CARD_WRITING_METHOD
  )
  const [content, setContent] = useState<CardContent>(initial?.content ?? EMPTY_CARD_CONTENT)
  const [attachedImage, setAttachedImage] = useState<File | null>(initial?.attachedImage ?? null)
  const [quantity, setQuantity] = useState(initial?.quantity ?? DEFAULT_CARD_QUANTITY)
  const [showErrors, setShowErrors] = useState(false)

  const schema = useMemo(() => createCheckoutCardSchema(t, cardConfig), [t, cardConfig])

  // Both lists arrive from the API, so a pick that is no longer in them falls back to the first.
  const selectedSizeName = findCardSize(cardConfig, sizeName) ? sizeName : getDefaultCardSizeName(cardConfig)
  // An edited card keeps its own template even when that page of the list is not loaded.
  const picked = templates.find((template) => template.id === templateId)
  const selectedTemplate: CheckoutCardTemplate = picked
    ? toCheckoutCardTemplate(picked)
    : initial?.templateId === templateId
      ? readCheckoutCardTemplate(initial)
      : templates[0]
        ? toCheckoutCardTemplate(templates[0])
        : EMPTY_CARD_TEMPLATE

  // One card per unit of the product it is printed for, minus the units already carded.
  const attachedLine = lines.find((line) => line.lineId === lineId) ?? null
  const maxQuantity = Math.max(1, capacities.get(lineId)?.remaining ?? DEFAULT_CARD_QUANTITY)

  const draft: AiCheckoutCard = {
    type: 'ai',
    lineId,
    ...selectedTemplate,
    sizeName: selectedSizeName,
    writingMethod,
    content: trimCardContent(content),
    attachedImage,
    attachedImageUrl: '',
    quantity: Math.min(quantity, maxQuantity)
  }
  const draftIssues = getCardIssuePaths(schema, draft)
  const issues = showErrors ? draftIssues : EMPTY_ISSUE_PATHS
  const wordCount = countWords(draft.content.message)
  const maxWords = getCardMaxWords(cardConfig, selectedSizeName)
  const handwritingPrice = getCardHandwritingPrice(cardConfig, wordCount)
  const unitPrice = getCardUnitPrice({ config: cardConfig, sizeName: selectedSizeName, wordCount, writingMethod })

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
        <CardFormHeader type='ai' />

        <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center'>
          <p className='text-sm font-medium'>{t('orders.checkout.cards.noEligibleProductsTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {hasEligibleLine
              ? t('orders.checkout.cards.allProductsTaken')
              : t('orders.checkout.cards.noEligibleProducts')}
          </p>
        </div>

        <CardFormActions isEditing={false} disabled onSubmit={handleSubmit} onCancel={onCancel} />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <CardFormHeader type='ai' />

      <CheckoutProductPicker
        lines={lines}
        value={lineId}
        onChange={handleSelectLine}
        label={t('orders.checkout.cards.attachTo')}
        capacities={capacities}
        cardType='ai'
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

      <CardSizePicker sizes={cardConfig.sizes} value={selectedSizeName} onChange={setSizeName} />

      <CardContentFields
        value={content}
        onChange={(next) => {
          setContent(next)
          if (showErrors) setShowErrors(false)
        }}
        messageInvalid={issues.has('content.message')}
        maxWords={maxWords}
        surcharge={writingMethod === 'handwritten' ? handwritingPrice : 0}
      />

      <CardWritingPicker value={writingMethod} onChange={setWritingMethod} handwritingPrice={handwritingPrice} />

      <CardAttachmentField value={attachedImage} onChange={setAttachedImage} />

      <p className='flex items-start gap-2 text-xs text-muted-foreground'>
        <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.75} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('orders.checkout.cards.aiPendingNote')}
      </p>

      <CardFormSummary
        price={unitPrice * draft.quantity}
        quantity={attachedLine ? { value: draft.quantity, unitPrice, max: maxQuantity, onChange: setQuantity } : null}
      />

      <Separator />

      <CardFormActions isEditing={!!initial} onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  )
}
