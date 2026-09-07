'use client'

import { MOCK_STUDIO_GENERATIONS } from '@/features/studio/generation-history'
import type { StudioGeneration } from '@/features/studio/types'
import { useMemo } from 'react'

/**
 * The account's studio history, newest first.
 * TODO(backend): swap the body for the generations query.
 */
export const useStudioGenerations = () => {
  const generations = useMemo<StudioGeneration[]>(
    () => [...MOCK_STUDIO_GENERATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    []
  )

  return { generations, isLoadingGenerations: false }
}
