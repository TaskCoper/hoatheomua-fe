'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { sanitizeRichText } from '@/lib/sanitize'
import { cn } from '@/shared/utils'
import { useEffect, useMemo, useRef, type MouseEvent } from 'react'

interface SanitizedHtmlProps {
  /** The raw HTML string to be sanitized and displayed. */
  html: string
  /** Optional class names to apply to the root element. */
  className?: string
  /** Optional element type to render as (e.g., 'div', 'article'). Defaults to 'div'. */
  as?: keyof React.JSX.IntrinsicElements
}

export default function SanitizedHtml({ html, className, as: Component = 'div' }: SanitizedHtmlProps) {
  const router = useRouter()

  // Server-safe base markup. `sanitizeRichText` is DOM-free precisely so this
  // runs identically here and during SSR; hydration depends on the two matching.
  // The DOM refinement below only runs after mount.
  const baseHtml = useMemo(() => sanitizeRichText(html), [html])

  const containerRef = useRef<HTMLElement>(null)

  // Client-only DOM refinement. Mutates the already-rendered container
  // directly instead of going through state, so it doesn't trigger a
  // second React render.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const STRIP_ATTRS = ['style', 'class', 'bgcolor', 'color', 'align', 'face', 'size']
    container.querySelectorAll('*').forEach((el) => {
      STRIP_ATTRS.forEach((attr) => el.removeAttribute(attr))
    })

    container.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer')
    })

    const isEmptyBlock = (el: Element | null) => {
      if (!el || el.tagName !== 'P') return false
      if (el.querySelector('img, iframe, video, audio, picture, svg')) return false
      return (el.textContent ?? '').replace(/ /g, ' ').trim() === ''
    }
    while (isEmptyBlock(container.lastElementChild)) {
      container.lastElementChild!.remove()
    }
  }, [baseHtml])

  const handleContainerClick = (event: MouseEvent<Element>) => {
    const target = event.target as Element
    const link = target.closest('a[href]')

    if (!(link instanceof HTMLAnchorElement)) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return

    const href = link.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return
    }

    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return

    event.preventDefault()
    router.push(`${url.pathname}${url.search}${url.hash}`)
  }

  const ElementType = Component as React.ElementType

  return (
    <ElementType
      ref={containerRef}
      onClick={handleContainerClick}
      className={cn('hth-rich-text', className)}
      dangerouslySetInnerHTML={{ __html: baseHtml }}
    />
  )
}
