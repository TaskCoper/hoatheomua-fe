import { useCallbackRef } from '@/hooks/use-callback-ref'
import { useEffect, useRef } from 'react'

interface UseLoadMoreOnViewOptions {
  /** Whether there is another page to fetch and nothing is already in flight. */
  enabled: boolean
  onLoadMore: () => void
  /** How far ahead of the sentinel the next page starts loading. */
  rootMargin?: string
}

/**
 * Infinite scroll: attach the returned ref to an element at the end of a list and the next page
 * is fetched as that element comes near the viewport.
 *
 * The observer watches the viewport rather than a named scroll container, so a sentinel inside an
 * `overflow-y-auto` column or a dialog still works - an ancestor's clipping hides it all the same.
 *
 * It is also rebuilt whenever `enabled` flips back to true, so a sentinel still on screen once a
 * page lands keeps pulling the next one instead of waiting for a scroll that never comes.
 */
export function useLoadMoreOnView<T extends HTMLElement = HTMLDivElement>({
  enabled,
  onLoadMore,
  rootMargin = '320px 0px'
}: UseLoadMoreOnViewOptions) {
  const sentinelRef = useRef<T>(null)
  // Callers pass inline arrows; without this the observer would be torn down on every render.
  const loadMore = useCallbackRef(onLoadMore)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !enabled) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [enabled, rootMargin, loadMore])

  return sentinelRef
}
