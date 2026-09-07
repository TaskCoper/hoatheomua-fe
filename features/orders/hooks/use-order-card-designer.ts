'use client'

import { useEffect, useRef, useState } from 'react'
import { EMPTY_CARD_CONTENT, isSameCardContent, trimCardContent } from '../cards/card-data'
import { findOrderCardVersion, getOrderCardArtwork, getSelectedOrderCardVersion } from '../cards/order-card-data'
import type { CardContent, CardWritingMethod, OrderAiCard, OrderCardVersion } from '../cards/types'

export const ORDER_CARD_STAGE_KEYS = ['reading', 'sketching', 'painting', 'finishing'] as const

const STAGE_INTERVAL_MS = 650
// TODO(backend): the real generation is asynchronous - swap the timer for the job status.
const GENERATION_MS = 2800

export type OrderCardGenerationStatus = 'idle' | 'generating'

interface UseOrderCardDesignerArgs {
  card: OrderAiCard
  /** Start a run as soon as the session opens, for the "generate again" entry point. */
  autoGenerate?: boolean
  onAddVersion: (cardId: string, version: OrderCardVersion) => void
}

/**
 * The editing session for one order card: the words being written, the version being looked
 * at, and the fake generation run. Design and size are not here - they are frozen on the card.
 */
export const useOrderCardDesigner = ({ card, autoGenerate, onAddVersion }: UseOrderCardDesignerArgs) => {
  const selectedVersion = getSelectedOrderCardVersion(card)

  const [activeVersionId, setActiveVersionId] = useState(selectedVersion?.id ?? '')
  const [content, setContent] = useState<CardContent>(selectedVersion?.content ?? EMPTY_CARD_CONTENT)
  const [writingMethod, setWritingMethod] = useState<CardWritingMethod>(card.writingMethod)
  // The session is remounted on every open, so this only ever fires for the run it was opened for.
  const [status, setStatus] = useState<OrderCardGenerationStatus>(
    autoGenerate && (selectedVersion?.content.message.length ?? 0) > 0 ? 'generating' : 'idle'
  )
  const [stage, setStage] = useState(0)
  const [showMessageError, setShowMessageError] = useState(false)

  // The generation timer reads both at the moment it lands, not when it started.
  const contentRef = useRef(content)
  const cardRef = useRef(card)
  useEffect(() => {
    contentRef.current = content
    cardRef.current = card
  })

  const activeVersion = findOrderCardVersion(card, activeVersionId) ?? selectedVersion
  const draft = trimCardContent(content)

  // New words only reach the card through a generation - the artwork is painted from them.
  const hasUnpaintedWords = !activeVersion || !isSameCardContent(draft, activeVersion.content)
  const isSelectedVersion = !!activeVersion && activeVersion.id === card.selectedVersionId
  const canGenerate = status === 'idle' && draft.message.length > 0
  const canApply =
    status === 'idle' &&
    !!activeVersion &&
    !hasUnpaintedWords &&
    (!isSelectedVersion || writingMethod !== card.writingMethod)

  const editContent = (next: CardContent) => {
    setContent(next)
    if (showMessageError) setShowMessageError(false)
  }

  const selectVersion = (versionId: string) => {
    const version = findOrderCardVersion(card, versionId)
    if (!version || status === 'generating') return

    setActiveVersionId(version.id)
    setContent(version.content)
    setShowMessageError(false)
  }

  const generate = () => {
    if (status === 'generating') return
    if (draft.message.length === 0) {
      setShowMessageError(true)
      return
    }

    setStage(0)
    setStatus('generating')
  }

  useEffect(() => {
    if (status !== 'generating') return

    const interval = window.setInterval(
      () => setStage((current) => Math.min(current + 1, ORDER_CARD_STAGE_KEYS.length - 1)),
      STAGE_INTERVAL_MS
    )

    const timeout = window.setTimeout(() => {
      const source = cardRef.current
      const label = source.versions.length + 1
      const version: OrderCardVersion = {
        id: `${source.id}-version-${label}`,
        label,
        imageUrl: getOrderCardArtwork(label),
        content: trimCardContent(contentRef.current),
        createdAt: new Date().toISOString()
      }

      onAddVersion(source.id, version)
      setActiveVersionId(version.id)
      setStatus('idle')
    }, GENERATION_MS)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [status, onAddVersion])

  return {
    activeVersion,
    activeVersionId,
    content,
    draft,
    writingMethod,
    status,
    stage,
    showMessageError,
    hasUnpaintedWords,
    isSelectedVersion,
    canGenerate,
    canApply,
    editContent,
    setWritingMethod,
    selectVersion,
    generate
  }
}
