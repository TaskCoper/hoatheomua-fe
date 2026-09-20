'use client'

import { useGetGeneratedCardsByProducts } from '@/hooks/use-get-generated-cards'
import { useMemo } from 'react'
import { toGeneratedCard } from '../cards/card-data'
import type { GeneratedCard } from '../cards/types'

const NO_GENERATED_CARDS: GeneratedCard[] = []

/**
 * The cards this customer already generated for the given products - the endpoint returns
 * everything, no paging. Nothing is asked for until a product is picked.
 */
export const useGeneratedCardsByProducts = (productIds: string[]) => {
  const { generatedCardItems, isGettingGeneratedCards, isGeneratedCardsError } = useGetGeneratedCardsByProducts({
    productIds
  })

  const generatedCards = useMemo(
    () => (productIds.length === 0 ? NO_GENERATED_CARDS : generatedCardItems.map(toGeneratedCard)),
    [generatedCardItems, productIds.length]
  )

  return {
    generatedCards,
    isGettingGeneratedCards,
    isGeneratedCardsError
  }
}
