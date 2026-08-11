'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

/**
 * `html { scroll-behavior: smooth }` (globals.css) is what makes in-page anchor
 * links glide instead of jump. It also intercepts Next's own scroll-to-top on
 * route navigation, animating it - and a layout shift as the new page's images
 * load can interrupt that animation, leaving the scroll a few pixels short of 0.
 *
 * Flipping to `auto` for the one layout-effect tick around a pathname change
 * makes Next's reset instant (this component mounts before `children` in the
 * tree, so its layout effect runs first) without touching the smooth behavior
 * anchor links rely on afterward.
 */
export default function RouteScrollReset() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    const id = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previous
    })

    return () => window.cancelAnimationFrame(id)
  }, [pathname])

  return null
}
