'use client'

import { useMemo } from 'react'
import { MOCK_GENERATED_CARDS } from '../cards/card-data'
import type { GeneratedCard } from '../cards/types'

/**
 * Every card this customer has generated, newest first - read by both the account
 * history and the checkout composer.
 * TODO(backend): replace with the user's generated-cards query.
 */
export const useGeneratedCards = () => {
  const generatedCards = useMemo<GeneratedCard[]>(
    () => [...MOCK_GENERATED_CARDS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    []
  )

  return { generatedCards, isLoadingGeneratedCards: false }
}
