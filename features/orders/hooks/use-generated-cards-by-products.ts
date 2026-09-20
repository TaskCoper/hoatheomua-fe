'use client'

import { useGetInfiniteGeneratedCardsByProducts } from '@/hooks/use-get-generated-cards'
import { useMemo } from 'react'
import { toGeneratedCard } from '../cards/card-data'
import type { GeneratedCard } from '../cards/types'

/** One page of the reuse gallery. */
export const GENERATED_CARD_PAGE_SIZE = 12

const NO_GENERATED_CARDS: GeneratedCard[] = []

/**
 * The cards this customer already generated for the given products, newest page first.
 * Nothing is asked for until a product is picked.
 */
export const useGeneratedCardsByProducts = (productIds: string[]) => {
  const {
    generatedCardItems,
    totalCount,
    isGettingGeneratedCards,
    isGeneratedCardsError,
    isGettingMoreGeneratedCards,
    hasMoreGeneratedCards,
    loadMoreGeneratedCards
  } = useGetInfiniteGeneratedCardsByProducts({ pageSize: GENERATED_CARD_PAGE_SIZE, productIds })

  const generatedCards = useMemo(
    () => (productIds.length === 0 ? NO_GENERATED_CARDS : generatedCardItems.map(toGeneratedCard)),
    [generatedCardItems, productIds.length]
  )

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
