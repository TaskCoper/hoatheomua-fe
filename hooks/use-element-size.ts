import { useEffect, useLayoutEffect, useState } from 'react'

export type ElementSize = {
  width: number
  height: number
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 }

// Every consumer is a client component that still renders on the server, where `useLayoutEffect`
// would warn. Measuring before paint only matters in the browser anyway.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Tracks the border-box size of an element.
 *
 * Takes the element itself rather than a ref, so callers hold it in state (`ref={setElement}`) and
 * re-measure when it mounts. Returns `{ width: 0, height: 0 }` until the first measurement, which
 * callers should read as "not measured yet" rather than "empty" and fall back accordingly.
 */
export const useElementSize = (element: HTMLElement | null): ElementSize => {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE)

  useIsomorphicLayoutEffect(() => {
    if (!element) return

    const apply = (width: number, height: number) => {
      // Rounding and bailing on no-ops keeps sub-pixel reflows from looping the observer.
      const next = { width: Math.round(width), height: Math.round(height) }
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
    }

    const rect = element.getBoundingClientRect()
    apply(rect.width, rect.height)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const box = entry.borderBoxSize?.[0]
      if (box) apply(box.inlineSize, box.blockSize)
      else apply(entry.contentRect.width, entry.contentRect.height)
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [element])

  return size
}
