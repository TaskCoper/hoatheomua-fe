'use client'

import { useGetInfiniteGeneratedCards } from '@/hooks/use-get-generated-cards'
import { useMemo } from 'react'
import { toGeneratedCardHistoryEntry } from '../cards/card-data'

/** One page of the account's card history - the rows are tall, so a page stays short. */
export const GENERATED_CARD_HISTORY_PAGE_SIZE = 10

/**
 * Every card this customer has generated, newest page first, as the account history draws
 * them. The checkout's reuse gallery asks a different endpoint - see
 * `useGeneratedCardsByProducts`, which only wants the cards of the products being carded.
 */
export const useGeneratedCardHistory = () => {
  const {
    generatedCardItems,
    totalCount,
    isGettingGeneratedCards,
    isGeneratedCardsError,
    isGettingMoreGeneratedCards,
    hasMoreGeneratedCards,
    loadMoreGeneratedCards
  } = useGetInfiniteGeneratedCards({ pageSize: GENERATED_CARD_HISTORY_PAGE_SIZE })

  const generatedCards = useMemo(() => generatedCardItems.map(toGeneratedCardHistoryEntry), [generatedCardItems])

  return {
    generatedCards,
    totalCount,
    isGettingGeneratedCards,
    isGeneratedCardsError,
    isGettingMoreGeneratedCards,
    hasMoreGeneratedCards,
    loadMoreGeneratedCards
  }
}
