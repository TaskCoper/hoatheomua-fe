'use client'

import type { CardTemplate } from '@/types/card-template.type'
import { useEffect, useRef, useState } from 'react'
import { countWords } from '../cards/card-config'
import { trimCardContent } from '../cards/card-data'
import { findOrderCardVersion } from '../cards/order-card-data'
import type { CardContent, CheckoutCardTemplate, OrderAiCard, OrderCardVersion } from '../cards/types'
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

  /**
   * The generation the form currently holds. A version brings its own design and words, so
   * selecting one loads them - but only once per version, or every keystroke would be undone
   * by the version still sitting under it.
   */
  const loadedVersionIdRef = useRef<string | null>(null)

  const { regenerateAiCard, isRegeneratingAiCard } = useRegenerateAiCard()
  const { setFinalOrderCard, isSettingFinalOrderCard } = useSetFinalOrderCard()

  // The studio opens on the newest artwork; the one that goes to print is the one ticked in
  // the strip, which is not necessarily the same card.
  const activeVersion = findOrderCardVersion(versions, activeVersionId) ?? versions.at(-1) ?? null

  /**
   * A version carries the design it was painted from but not that design's name or artwork, so
   * the card's own template is kept whole whenever the two are the same one.
   */
  const toFormTemplate = (version: OrderCardVersion): CheckoutCardTemplate =>
    version.templateId === card.templateId
      ? { templateId: card.templateId, templateName: card.templateName, templateImageUrl: card.templateImageUrl }
      : { templateId: version.templateId, templateName: '', templateImageUrl: '' }

  const draft = trimCardContent(content)
  const wordCount = countWords(draft.message)
  const isBelowBudget = wordCount < card.minWords
  const isOverBudget = card.maxWords > 0 && wordCount > card.maxWords

  const status: OrderCardGenerationStatus = isRegeneratingAiCard ? 'generating' : 'idle'

  // What a new run would change, measured against the version on screen - once one is loaded it
  // is the card being edited, and the words that were ordered are only the starting point.
  const baseline = activeVersion ?? { content: card.content, templateId: card.templateId }
  const hasChanges = draft.message !== baseline.content.message || template.templateId !== baseline.templateId

  const isTemplateLocked = !!card.sourceCardId

  /**
   * `finalGeneratedCardId` is the customer's final word on which artwork the florist prints.
   * Once it is set the card is settled: the studio still opens, but only to look through what
   * was generated - nothing here may paint over it or move the choice somewhere else. Browsing
   * the strip stays open, since that is looking at a version rather than choosing one.
   */
  const isSettled = !!card.selectedVersionId

  /** An empty list means "nothing painted yet" only once it is the server's actual answer. */
  const hasVersionHistory = !isLoadingVersions && !isVersionsError

  const isFirstRun = hasVersionHistory && versions.length === 0

  // A template is worth insisting on only when the run actually asks for one.
  const needsTemplate = !isFirstRun && !isTemplateLocked
  const canGenerate =
    !isSettled &&
    !isRegeneratingAiCard &&
    hasVersionHistory &&
    (!needsTemplate || !!template.templateId) &&
    wordCount > 0 &&
    !isBelowBudget &&
    !isOverBudget

  const isSelectedVersion = !!activeVersion && activeVersion.id === selectedVersionId

  // The version on screen is a whole card, so the form shows that card: its words in the field,
  // its design in the picker. Nothing to load before the first generation lands - the form then
  // holds what was ordered, which is what a first run is painted from.
  useEffect(() => {
    if (!activeVersion || loadedVersionIdRef.current === activeVersion.id) return

    loadedVersionIdRef.current = activeVersion.id
    setContent(activeVersion.content)
    setTemplate(toFormTemplate(activeVersion))
    setShowMessageError(false)
    // `toFormTemplate` closes over the card alone, which cannot change under one open studio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion])

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
    if (isSettled) return

    setContent(next)
    if (showMessageError) setShowMessageError(false)
  }

  const editTemplate = (next: CardTemplate) => {
    if (isTemplateLocked || isSettled) return

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
    if (isSettingFinalOrderCard || isSettled) return

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
    if (isRegeneratingAiCard || isSettled) return
    // Without the card's generations in hand there is no telling a first run from a rerun,
    // and either guess posts the wrong body.
    if (!hasVersionHistory) return
    if (wordCount === 0 || isBelowBudget || isOverBudget) {
      setShowMessageError(true)
      return
    }

    setStage(0)
    regenerateAiCard(
      {
        orderDetailId: card.orderDetailsId,
        virtualId: card.id,
        // The version on screen is the one the form was loaded from, so it is the one being
        // painted over - not simply the newest in the list.
        sourceCardId: isFirstRun ? null : (activeVersion?.id ?? null),
        cardTemplateId: isFirstRun ? null : template.templateId || null,
        messageContent: isFirstRun ? null : draft.message
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
    isTemplateLocked,
    isSettled,
    isSelectedVersion,
    editContent,
    editTemplate,
    selectVersion,
    applyVersion,
    generate
  }
}
