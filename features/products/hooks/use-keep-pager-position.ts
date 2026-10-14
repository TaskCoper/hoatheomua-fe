'use client'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

export const useKeepPagerPosition = ({ content, isFetching }: { content: unknown; isFetching: boolean }) => {
  const pagerRef = useRef<HTMLElement>(null)
  const anchorRef = useRef<{ top: number; scrollY: number } | null>(null)

  const rememberPagerPosition = useCallback(() => {
    const pager = pagerRef.current
    anchorRef.current = pager ? { top: pager.getBoundingClientRect().top, scrollY: window.scrollY } : null
  }, [])

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const pager = pagerRef.current
    if (!anchor || !pager) return

    anchorRef.current = null
    if (window.scrollY !== anchor.scrollY) return

    const drift = pager.getBoundingClientRect().top - anchor.top
    // `instant`: the page sets `scroll-behavior: smooth`, which would turn the correction into a visible slide.
    if (Math.abs(drift) >= 1) window.scrollBy({ top: drift, behavior: 'instant' })
  }, [content])

  // The request settled without the cards changing (same data, or it failed): nothing moved.
  useEffect(() => {
    if (!isFetching) anchorRef.current = null
  }, [isFetching])

  return { pagerRef, rememberPagerPosition }
}
