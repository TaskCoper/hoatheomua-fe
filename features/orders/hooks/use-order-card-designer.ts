'use client'

import type { CardTemplate } from '@/types/card-template.type'
import { useEffect, useState } from 'react'
import { countWords } from '../cards/card-config'
import { trimCardContent } from '../cards/card-data'
import { findOrderCardVersion } from '../cards/order-card-data'
import type { CardContent, CheckoutCardTemplate, OrderAiCard } from '../cards/types'
import { useOrderCardVersions } from './use-order-card-versions'
import { useRegenerateAiCard } from './use-regenerate-ai-card'
import { useSetFinalOrderCard } from './use-set-final-order-card'

export const ORDER_CARD_STAGE_KEYS = ['reading', 'sketching', 'painting', 'finishing'] as const

const STAGE_INTERVAL_MS = 2000

export type OrderCardGenerationStatus = 'idle' | 'generating'

interface UseOrderCardDesignerArgs {
  card: OrderAiCard
  /** Only the open studio asks for the card's generations. */
  enabled: boolean
}

/**
 * The editing session for one order card. Everything else about the card was paid for and is
 * frozen - the design and the words are all that can still change, and the words have to stay
 * inside the budget the card was priced on.
 */
export const useOrderCardDesigner = ({ card, enabled }: UseOrderCardDesignerArgs) => {
  const { versions, isLoadingVersions, isVersionsError } = useOrderCardVersions({
    orderDetailsId: card.orderDetailsId,
    virtualId: card.id,
    enabled
  })

  const [template, setTemplate] = useState<CheckoutCardTemplate>({
    templateId: card.templateId,
    templateName: card.templateName,
    templateImageUrl: card.templateImageUrl
  })
  const [content, setContent] = useState<CardContent>(card.content)
  const [activeVersionId, setActiveVersionId] = useState(card.selectedVersionId)
  const [selectedVersionId, setSelectedVersionId] = useState(card.selectedVersionId)
  const [showMessageError, setShowMessageError] = useState(false)
  const [stage, setStage] = useState(0)

  const { regenerateAiCard, isRegeneratingAiCard } = useRegenerateAiCard()
  const { setFinalOrderCard, isSettingFinalOrderCard } = useSetFinalOrderCard()

  // The studio opens on the newest artwork; the one that goes to print is the one ticked in
  // the strip, which is not necessarily the same card.
  const activeVersion = findOrderCardVersion(versions, activeVersionId) ?? versions.at(-1) ?? null

  const draft = trimCardContent(content)
  const wordCount = countWords(draft.message)
  const isBelowBudget = wordCount < card.minWords
  const isOverBudget = card.maxWords > 0 && wordCount > card.maxWords

  const status: OrderCardGenerationStatus = isRegeneratingAiCard ? 'generating' : 'idle'
  const hasChanges = draft.message !== card.content.message || template.templateId !== card.templateId
  const canGenerate = !isRegeneratingAiCard && !!template.templateId && wordCount > 0 && !isBelowBudget && !isOverBudget

  const isSelectedVersion = !!activeVersion && activeVersion.id === selectedVersionId

  // The run is server-side and gives no progress of its own, so the stages are paced by the
  // clock - they say what is happening, not how far along it is.
  useEffect(() => {
    if (!isRegeneratingAiCard) return

    const interval = window.setInterval(
      () => setStage((current) => Math.min(current + 1, ORDER_CARD_STAGE_KEYS.length - 1)),
      STAGE_INTERVAL_MS
    )

    return () => window.clearInterval(interval)
  }, [isRegeneratingAiCard])

  const editContent = (next: CardContent) => {
    setContent(next)
    if (showMessageError) setShowMessageError(false)
  }

  const editTemplate = (next: CardTemplate) => {
    setTemplate({ templateId: next.id, templateName: next.name, templateImageUrl: next.imageUrl })
  }

  const selectVersion = (versionId: string) => {
    if (isRegeneratingAiCard) return
    if (!findOrderCardVersion(versions, versionId)) return

    setActiveVersionId(versionId)
  }

  /** Writes the choice to `snapShotCard.finalGeneratedCardId`; the tick follows the server. */
  const applyVersion = (
    versionId: string,
    { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {}
  ) => {
    if (isSettingFinalOrderCard) return

    setFinalOrderCard(
      { orderDetailId: card.orderDetailsId, virtualId: card.id, generatedCardId: versionId },
      {
        // The order refetch settles it too, but the tick should not wait on a round trip.
        onSuccess: () => {
          setSelectedVersionId(versionId)
          onSuccess?.()
        },
        onError: () => onError?.()
      }
    )
  }

  const generate = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {}) => {
    if (isRegeneratingAiCard) return
    if (wordCount === 0 || isBelowBudget || isOverBudget) {
      setShowMessageError(true)
      return
    }

    setStage(0)
    regenerateAiCard(
      {
        orderDetailId: card.orderDetailsId,
        virtualId: card.id,
        sourceCardId: card.sourceCardId,
        cardTemplateId: template.templateId,
        messageContent: draft.message
      },
      {
        onSuccess: () => {
          setContent(draft)
          // The run it just asked for is the one worth looking at, whichever was on screen.
          setActiveVersionId('')
          onSuccess?.()
        },
        onError: () => onError?.()
      }
    )
  }

  return {
    versions,
    isLoadingVersions,
    isVersionsError,
    activeVersion,
    activeVersionId: activeVersion?.id ?? '',
    selectedVersionId,
    template,
    content,
    draft,
    wordCount,
    isBelowBudget,
    isOverBudget,
    status,
    stage,
    isApplying: isSettingFinalOrderCard,
    showMessageError,
    hasChanges,
    canGenerate,
    isSelectedVersion,
    editContent,
    editTemplate,
    selectVersion,
    applyVersion,
    generate
  }
}
