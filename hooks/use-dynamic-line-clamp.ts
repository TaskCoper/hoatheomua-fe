'use client'

import { useEffect, useRef, useState } from 'react'

export const useDynamicLineClamp = <T extends HTMLElement = HTMLDivElement>(fallbackLines = 3) => {
  const ref = useRef<T>(null)
  const [lines, setLines] = useState(fallbackLines)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight)
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) return
      setLines(Math.max(1, Math.floor(element.clientHeight / lineHeight)))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return {
    ref,
    lines,
    style: {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: lines,
      overflow: 'hidden'
    } as const
  }
}
