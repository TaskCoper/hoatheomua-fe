'use client'

import { useEffect, useState } from 'react'

// Matches the section anchors' scroll-mt-28 offset (7rem) plus a small buffer,
// so a section is considered active once it has scrolled up to where a click
// on its TOC link would actually land it.
const ACTIVATION_OFFSET = 130

/**
 * Tracks which section id is currently the "active" one in the viewport, for the
 * sidebar table-of-contents. Walks the sections in document order on scroll and
 * picks the last one whose top has crossed the activation line, so it stays
 * correct even for short sections or ones near the bottom of the page where
 * there isn't enough room left to scroll them up to that line.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  // Serialize ids so the effect re-runs only when the set actually changes.
  const key = ids.join('|')

  useEffect(() => {
    const sectionIds = key ? key.split('|') : []
    if (sectionIds.length === 0) return

    let ticking = false

    const update = () => {
      ticking = false

      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      if (elements.length === 0) return

      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (nearBottom) {
        setActiveId(elements[elements.length - 1].id)
        return
      }

      let current = elements[0].id
      for (const el of elements) {
        if (el.getBoundingClientRect().top > ACTIVATION_OFFSET) break
        current = el.id
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])

  return activeId
}
