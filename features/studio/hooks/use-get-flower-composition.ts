'use client'

import aiFlowerService from '@/features/studio/services'
import type { GeneratedFlowerComposition } from '@/features/studio/types'
import { queryOptions, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

export const FLOWER_COMPOSITION_QUERY_PREFIX = ['flower-composition'] as const

export const flowerCompositionQuery = (flowerId: string) =>
  queryOptions({
    queryKey: [...FLOWER_COMPOSITION_QUERY_PREFIX, flowerId] as const,
    queryFn: () => aiFlowerService.getGeneratedFlowerComposition({ flowerId }),
    enabled: Boolean(flowerId)
  })

export interface FlowerCompositionState {
  composition: GeneratedFlowerComposition | null
  isResolving: boolean
}

/**
 * The AI counterpart of `useGetProductSummary`: a bouquet designed in the studio is not
 * a catalogue row, so the cart and checkout read its name, artwork and flowers from
 * `v1/ai-flowers/{id}/composition` instead of the product endpoints.
 */
export const useGetFlowerCompositions = ({ flowerIds }: { flowerIds: string[] }) => {
  const ids = useMemo(() => Array.from(new Set(flowerIds.filter(Boolean))), [flowerIds])

  const queries = useQueries({
    queries: ids.map((id) => flowerCompositionQuery(id))
  })

  const compositionByFlowerId = useMemo(() => {
    const map = new Map<string, FlowerCompositionState>()
    ids.forEach((id, index) => {
      const query = queries[index]
      map.set(id, {
        composition: query?.data ?? null,
        isResolving: !query || query.isLoading
      })
    })
    return map
  }, [ids, queries])

  return { compositionByFlowerId }
}
