'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { findOrderCardVersion, toOrderCardVersions } from '../cards/order-card-data'
import type { OrderAiCard, OrderCardVersion } from '../cards/types'
import { getOrderDetailCardsQuery } from '../queries'

export interface OrderFinalCard {
  card: OrderAiCard
  /** The generation named by `finalGeneratedCardId`; `null` until the line's list has landed. */
  version: OrderCardVersion | null
}

/**
 * The artwork each settled card goes to print as. The snapshot names the chosen generation by id
 * only, so the line's generations have to be read back to put a picture to it - through the very
 * query the studio opens on, so opening one afterwards costs no second round trip.
 */
export const useOrderFinalCards = (cards: OrderAiCard[]) => {
  const settledCards = useMemo(() => cards.filter((card) => !!card.selectedVersionId), [cards])

  const results = useQueries({
    queries: settledCards.map((card) =>
      getOrderDetailCardsQuery({ orderDetailsId: card.orderDetailsId, virtualId: card.id })
    )
  })

  // `results` is a fresh array on every render, so there is nothing stable to memoise against.
  const finalCards: OrderFinalCard[] = settledCards.map((card, index) => ({
    card,
    version: findOrderCardVersion(toOrderCardVersions(results[index]?.data ?? []), card.selectedVersionId)
  }))

  return { finalCards, isLoadingFinalCards: results.some((result) => result.isLoading) }
}
