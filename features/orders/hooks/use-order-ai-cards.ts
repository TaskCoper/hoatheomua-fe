'use client'

import { useCallback, useState } from 'react'
import { buildMockOrderAiCards } from '../cards/order-card-data'
import type { CardWritingMethod, OrderAiCard, OrderCardVersion } from '../cards/types'
import type { OrderItem } from '../types'

interface ApplyVersionArgs {
  versionId: string
  writingMethod: CardWritingMethod
}

/**
 * Holds the AI cards of a placed order and the versions generated for them.
 * TODO(backend): seed from the order's card list and persist the generations server-side;
 * everything here lives in component state for the showcase.
 */
export const useOrderAiCards = (items: OrderItem[]) => {
  const [cards, setCards] = useState<OrderAiCard[]>(() => buildMockOrderAiCards(items))

  const updateCard = useCallback((cardId: string, updater: (card: OrderAiCard) => OrderAiCard) => {
    setCards((current) => current.map((card) => (card.id === cardId ? updater(card) : card)))
  }, [])

  const addVersion = useCallback(
    (cardId: string, version: OrderCardVersion) => {
      updateCard(cardId, (card) => ({ ...card, versions: [...card.versions, version] }))
    },
    [updateCard]
  )

  const applyVersion = useCallback(
    (cardId: string, { versionId, writingMethod }: ApplyVersionArgs) => {
      updateCard(cardId, (card) => ({ ...card, selectedVersionId: versionId, writingMethod }))
    },
    [updateCard]
  )

  return { cards, addVersion, applyVersion }
}
