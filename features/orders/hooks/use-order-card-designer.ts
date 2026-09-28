'use client'

import type { CardTemplate } from '@/types/card-template.type'
import { useEffect, useRef, useState } from 'react'
import { countWords } from '../cards/card-config'
import { trimCardContent } from '../cards/card-data'
import { findOrderCardVersion } from '../cards/order-card-data'
import type { CardContent, CheckoutCardTemplate, OrderAiCard, OrderCardVersion } from '../cards/types'
import type { RegenerateAiCardPayload } from '../types'
import { useOrderCardVersions } from './use-order-card-versions'
import { useRegenerateAiCard, type CardJobError } from './use-regenerate-ai-card'
import { useSetFinalOrderCard } from './use-set-final-order-card'

export const ORDER_CARD_STAGE_KEYS = ['queued', 'generating', 'saving'] as const

export type OrderCardGenerationStatus = 'idle' | 'generating'

interface UseOrderCardDesignerArgs {
  card: OrderAiCard
  enabled: boolean
}

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

  const loadedVersionIdRef = useRef<string | null>(null)

  const {
    regenerateAiCard,
    isRegeneratingAiCard,
    isCheckingJobs,
    job,
    stage,
    cancelJob,
    isCanceling,
    isConnectionError
  } = useRegenerateAiCard(
    {
      orderDetailsId: card.orderDetailsId,
      virtualId: card.id
    },
    enabled
  )
  const { setFinalOrderCard, isSettingFinalOrderCard } = useSetFinalOrderCard()

  const activeVersion = findOrderCardVersion(versions, activeVersionId) ?? versions.at(-1) ?? null

  const toFormTemplate = (version: OrderCardVersion): CheckoutCardTemplate =>
    version.templateId === card.templateId
      ? { templateId: card.templateId, templateName: card.templateName, templateImageUrl: card.templateImageUrl }
      : { templateId: version.templateId, templateName: '', templateImageUrl: '' }

  const draft = trimCardContent(content)
  const wordCount = countWords(draft.message)
  const isOverBudget = card.maxWords > 0 && wordCount > card.maxWords

  const status: OrderCardGenerationStatus = isRegeneratingAiCard ? 'generating' : 'idle'

  // What a new run would change, measured against the version on screen - once one is loaded it
  // is the card being edited, and the words that were ordered are only the starting point.
  const baseline = activeVersion ?? { content: card.content, templateId: card.templateId }
  const hasChanges = draft.message !== baseline.content.message || template.templateId !== baseline.templateId

  // Either the card was ordered as a reuse of an earlier generation, or the snapshot already
  // carries the artwork it is printed from - either way the picture is set and only the words
  // are still open. The run may carry a design for such a card, but this is where that is
  // refused: what it sends is the one the card was bought with.
  const isTemplateLocked = !!card.sourceCardId || !!card.rawImageUrl

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

  /**
   * The first run carries nothing of its own - it paints the card exactly as it was ordered -
   * so there is nothing to change until it lands. The same holds while the list that would
   * tell a first run from a rerun is still in flight, and while a run is in flight: the payload
   * left with the request, so edits made mid-run would be silently discarded when it lands.
   */
  const isEditLocked = isSettled || !hasVersionHistory || isFirstRun || isRegeneratingAiCard

  // A template is worth insisting on only when the run actually carries one.
  const needsTemplate = !isFirstRun && !isTemplateLocked
  const canGenerate =
    !isSettled &&
    !isRegeneratingAiCard &&
    !isCheckingJobs &&
    hasVersionHistory &&
    (!needsTemplate || !!template.templateId) &&
    wordCount > 0 &&
    !isOverBudget

  const isSelectedVersion = !!activeVersion && activeVersion.id === selectedVersionId

  useEffect(() => {
    if (!activeVersion || loadedVersionIdRef.current === activeVersion.id) return

    loadedVersionIdRef.current = activeVersion.id
    setContent(activeVersion.content)
    setTemplate(toFormTemplate(activeVersion))
    setShowMessageError(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion])

  const editContent = (next: CardContent) => {
    if (isEditLocked) return

    setContent(next)
    if (showMessageError) setShowMessageError(false)
  }

  const editTemplate = (next: CardTemplate) => {
    if (isTemplateLocked || isEditLocked) return

    setTemplate({ templateId: next.id, templateName: next.name, templateImageUrl: next.imageUrl })
  }

  const selectVersion = (versionId: string) => {
    if (isRegeneratingAiCard) return
    if (!findOrderCardVersion(versions, versionId)) return

    setActiveVersionId(versionId)
  }

  const applyVersion = (
    versionId: string,
    { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {}
  ) => {
    if (isSettingFinalOrderCard || isSettled) return

    setFinalOrderCard(
      { orderDetailId: card.orderDetailsId, virtualId: card.id, generatedCardId: versionId },
      {
        onSuccess: () => {
          setSelectedVersionId(versionId)
          onSuccess?.()
        },
        onError: () => onError?.()
      }
    )
  }

  const generate = ({
    onSuccess,
    onError
  }: { onSuccess?: () => void; onError?: (error?: CardJobError) => void } = {}) => {
    if (isRegeneratingAiCard || isSettled) return
    if (!hasVersionHistory) return
    if (wordCount === 0 || isOverBudget) {
      setShowMessageError(true)
      return
    }

    const sourceCardId = isFirstRun ? null : (activeVersion?.id ?? null)
    if (!isFirstRun && !sourceCardId) return

    const body: RegenerateAiCardPayload = sourceCardId
      ? {
          sourceCardId,
          cardTemplateId: template.templateId || null,
          messageContent: draft.message
        }
      : {
          orderDetailId: card.orderDetailsId,
          virtualId: card.id
        }

    regenerateAiCard(body, {
      onSuccess: () => {
        setContent(draft)
        setActiveVersionId('')
        onSuccess?.()
      },
      onError: (error) => onError?.(error)
    })
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
    isOverBudget,
    status,
    stage,
    job,
    cancelJob,
    isCanceling,
    isConnectionError,
    isApplying: isSettingFinalOrderCard,
    showMessageError,
    hasChanges,
    canGenerate,
    isTemplateLocked,
    isEditLocked,
    isFirstRun,
    isSettled,
    isSelectedVersion,
    editContent,
    editTemplate,
    selectVersion,
    applyVersion,
    generate
  }
}
