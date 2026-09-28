'use client'

import { BREAKPOINTS, useMediaQuery } from '@/hooks/use-media-query'

const MOBILE_BREAKPOINT = BREAKPOINTS.md

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false)
}
