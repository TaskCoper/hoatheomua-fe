'use client'

import { useCallback, useState } from 'react'
import { cacheTemplateRatio, getCachedTemplateRatios } from '../cards/template-orientation'

/** Aspect ratios filled in as each image paints - the API carries no dimensions. */
export const useCardTemplateRatios = () => {
  const [ratios, setRatios] = useState<ReadonlyMap<string, number>>(getCachedTemplateRatios)

  const measureTemplate = useCallback(
    (templateId: string, { naturalWidth, naturalHeight }: { naturalWidth: number; naturalHeight: number }) => {
      if (!naturalWidth || !naturalHeight) return
      if (!cacheTemplateRatio(templateId, naturalWidth / naturalHeight)) return

      setRatios(getCachedTemplateRatios())
    },
    []
  )

  return { ratios, measureTemplate }
}
