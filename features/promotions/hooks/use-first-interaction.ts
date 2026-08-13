'use client'

import { useEffect, useState } from 'react'

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

/**
 * True once the visitor has tapped, typed or scrolled.
 *
 * Chrome stops nominating new LCP candidates at the first input of any of those
 * kinds. Gating the popup on one keeps its full-viewport image out of the LCP
 * measurement entirely - a fixed timer cannot, because LCP keeps updating for
 * every larger paint until that first input.
 *
 * A visitor who never interacts never sees the popup. That is the point: showing
 * it to them would just report their LCP as "however long they stared".
 */
export function useFirstInteraction() {
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (hasInteracted) return

    const onInteract = () => setHasInteracted(true)
    const options = { passive: true, once: true } as const

    for (const type of INTERACTION_EVENTS) window.addEventListener(type, onInteract, options)

    return () => {
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, onInteract)
    }
  }, [hasInteracted])

  return hasInteracted
}
