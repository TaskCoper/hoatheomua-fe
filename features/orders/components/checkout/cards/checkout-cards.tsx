'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { Mail01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { hasCardConfig } from '../../../cards/card-config'
import { getLineCardCapacities } from '../../../cards/card-data'
import type { CheckoutCard, CheckoutCardField, CheckoutCardType } from '../../../cards/types'
import { useCardConfig } from '../../../hooks/use-card-config'
import CheckoutSection, { CheckoutPanel } from '../checkout-section'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import AiCardForm from './ai-card-form'
import CardTypePicker, { CARD_TYPES } from './card-type-picker'
import CheckoutCardList from './checkout-card-list'
import { isCardEligibleLine, isLineOpenForCard } from './checkout-product-picker'
import HistoryCardForm from './history-card-form'
import StandardCardForm from './standard-card-form'

interface ComposerState {
  type: CheckoutCardType
  editingIndex: number | null
}

interface CheckoutCardsProps {
  lines: CheckoutSummaryLine[]
  cards: CheckoutCardField[]
  onSave: (card: CheckoutCard, editingIndex: number | null) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

export default function CheckoutCards({ lines, cards, onSave, onRemove, readOnly }: CheckoutCardsProps) {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()

  const [composer, setComposer] = useState<ComposerState | null>(null)
  const [isPickingType, setIsPickingType] = useState(false)

  const editingCard = composer?.editingIndex != null ? (cards[composer.editingIndex] ?? null) : null

  // The card being edited must not count against its own line, or it could never grow.
  const editingIndex = composer?.editingIndex ?? null
  const capacities = useMemo(() => getLineCardCapacities(lines, cards, editingIndex), [lines, cards, editingIndex])

  const isCardConfigReady = hasCardConfig(cardConfig)

  const unavailableTypes = useMemo(() => {
    const reasons: Partial<Record<CheckoutCardType, I18nKey>> = {}

    if (!isCardConfigReady) {
      CARD_TYPES.forEach((type) => {
        reasons[type] = 'orders.checkout.cards.configUnavailable'
      })

      return reasons
    }

    const hasEligibleLine = lines.some(isCardEligibleLine)
    const noProductLeft: I18nKey = hasEligibleLine
      ? 'orders.checkout.cards.allProductsTaken'
      : 'orders.checkout.cards.noEligibleProducts'

    // Only rendered while no card is open, so the capacities already count every saved card.
    CARD_TYPES.forEach((type) => {
      if (!lines.some((line) => isLineOpenForCard(line, capacities, type))) reasons[type] = noProductLeft
    })

    return reasons
  }, [lines, capacities, isCardConfigReady])

  const canAddMore = CARD_TYPES.some((type) => !unavailableTypes[type])

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
          lines={lines}
          capacities={capacities}
          initial={editingCard?.type === 'standard' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
        />
      ) : composer.type === 'ai' ? (
        <AiCardForm
          key={editingCard?.id ?? 'new'}
          lines={lines}
          capacities={capacities}
          initial={editingCard?.type === 'ai' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
        />
      ) : (
        <HistoryCardForm
          key={editingCard?.id ?? 'new'}
          lines={lines}
          capacities={capacities}
          initial={editingCard?.type === 'history' ? editingCard : null}
          onSubmit={handleSubmit}
          onCancel={() => setComposer(null)}
          onCreateFirst={() => openComposer({ type: 'ai', editingIndex: null })}
        />
      )}

      {cards.length > 0 && !composer ? (
        <div className='space-y-1.5'>
          <CheckoutCardList cards={cards} lines={lines} onEdit={handleEdit} onRemove={onRemove} readOnly={readOnly} />
        </div>
      ) : null}

      {readOnly || composer ? null : cards.length === 0 || isPickingType ? (
        <CardTypePicker
          unavailableTypes={unavailableTypes}
          onPick={(type) => openComposer({ type, editingIndex: null })}
        />
      ) : (
        <Button
          type='button'
          variant='outline'
          className='w-full'
          disabled={!canAddMore}
          onClick={() => setIsPickingType(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          {canAddMore
            ? t('orders.checkout.cards.addAnother')
            : isCardConfigReady
              ? t('orders.checkout.cards.allProductsTaken')
              : t('orders.checkout.cards.configUnavailable')}
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
