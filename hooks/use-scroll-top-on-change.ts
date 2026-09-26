import { useEffect, type RefObject } from 'react'

/**
 * Sends the reader back to the top whenever `value` changes - a step of a wizard, a page of a
 * list - so the new content never opens halfway down the previous one.
 *
 * Both the window and `container` are scrolled: a column that is `overflow-y-auto` from `lg` up
 * scrolls itself on desktop while the window scrolls on small screens, and only one of the two
 * has anywhere to go at a given breakpoint.
 */
export function useScrollTopOnChange(value: unknown, container?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    // Instant, not smooth: the content has already been swapped, so gliding over it reads as a
    // glitch rather than as movement.
    container?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [value, container])
}
