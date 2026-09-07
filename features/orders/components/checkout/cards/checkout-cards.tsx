'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Mail01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import type { CheckoutCard, CheckoutCardField, CheckoutCardType, GeneratedCard } from '../../../cards/types'
import CheckoutSection, { CheckoutPanel } from '../checkout-section'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import AiCardForm from './ai-card-form'
import CardTypePicker from './card-type-picker'
import CheckoutCardList from './checkout-card-list'
import { isCardEligibleLine } from './checkout-product-picker'
import HistoryCardForm from './history-card-form'
import StandardCardForm from './standard-card-form'

interface ComposerState {
  type: CheckoutCardType
  editingIndex: number | null
}

interface CheckoutCardsProps {
  lines: CheckoutSummaryLine[]
  cards: CheckoutCardField[]
  generatedCards: GeneratedCard[]
  onSave: (card: CheckoutCard, editingIndex: number | null) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

export default function CheckoutCards({
  lines,
  cards,
  generatedCards,
  onSave,
  onRemove,
  readOnly
}: CheckoutCardsProps) {
  const { t } = useTranslation()

  const [composer, setComposer] = useState<ComposerState | null>(null)
  const [isPickingType, setIsPickingType] = useState(false)

  const editingCard = composer?.editingIndex != null ? (cards[composer.editingIndex] ?? null) : null
  const eligibleProductCount = lines.filter(isCardEligibleLine).length

  const openComposer = (next: ComposerState) => {
    setComposer(next)
    setIsPickingType(false)
  }

  const handleEdit = (card: CheckoutCardField, index: number) => {
    openComposer({ type: card.type, editingIndex: index })
  }

  const handleSubmit = (card: CheckoutCard) => {
    onSave(card, composer?.editingIndex ?? null)
    setComposer(null)
  }

  if (readOnly && cards.length === 0) return null

  const isComposing = !!composer && !readOnly

  const content = (
    <>
      {readOnly || !composer ? null : composer.type === 'standard' ? (
        <StandardCardForm
          key={editingCard?.id ?? 'new'}
          initial={editingCard?.type === 'standard' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
        />
      ) : composer.type === 'ai' ? (
        <AiCardForm
          key={editingCard?.id ?? 'new'}
          lines={lines}
          initial={editingCard?.type === 'ai' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
        />
      ) : (
        <HistoryCardForm
          key={editingCard?.id ?? 'new'}
          generatedCards={generatedCards}
          lines={lines}
          initial={editingCard?.type === 'history' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
          onCreateFirst={() => openComposer({ type: 'ai', editingIndex: null })}
        />
      )}

      {cards.length > 0 && !composer ? (
        <div className='space-y-1.5'>
          <CheckoutCardList
            cards={cards}
            generatedCards={generatedCards}
            lines={lines}
            onEdit={handleEdit}
            onRemove={onRemove}
            readOnly={readOnly}
          />
        </div>
      ) : null}

      {readOnly || composer ? null : cards.length === 0 || isPickingType ? (
        <CardTypePicker
          eligibleProductCount={eligibleProductCount}
          onPick={(type) => openComposer({ type, editingIndex: null })}
        />
      ) : (
        <Button type='button' variant='outline' className='w-full' onClick={() => setIsPickingType(true)}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          {t('orders.checkout.cards.addAnother')}
        </Button>
      )}
    </>
  )

  if (isComposing) return <CheckoutPanel className='space-y-4'>{content}</CheckoutPanel>

  return (
    <CheckoutSection
      icon={Mail01Icon}
      title={t('orders.checkout.cards.heading')}
      description={t('orders.checkout.cards.description')}
      contentClassName='space-y-4'
      action={
        <Badge variant='secondary' className='shrink-0 rounded-full px-2.5 py-1 font-normal'>
          {t('orders.checkout.cards.optional')}
        </Badge>
      }
    >
      {content}
    </CheckoutSection>
  )
}
