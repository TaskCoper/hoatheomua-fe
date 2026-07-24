'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import DOMPurify from 'isomorphic-dompurify'
import { useEffect, useMemo, useRef, type MouseEvent } from 'react'

interface SanitizedHtmlProps {
  /** The raw HTML string to be sanitized and displayed. */
  html: string
  /** Optional class names to apply to the root element. */
  className?: string
  /** Optional element type to render as (e.g., 'div', 'article'). Defaults to 'div'. */
  as?: keyof React.JSX.IntrinsicElements
}

// Configuration for DOMPurify to keep the component body clean
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'u',
    's',
    'sub',
    'sup',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'span',
    'div',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan', 'align', 'data-type'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'font'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload', 'style', 'color', 'bgcolor', 'face']
}

export default function SanitizedHtml({ html, className, as: Component = 'div' }: SanitizedHtmlProps) {
  const router = useRouter()

  // Server-safe base markup. This must be identical on the server and on the
  // first client render so hydration matches; the DOMParser refinement below
  // only runs after mount.
  const baseHtml = useMemo(
    () => DOMPurify.sanitize(html, PURIFY_CONFIG).replace(/ (style|class|bgcolor|color|align|face|size)="[^"]*"/gi, ''),
    [html]
  )

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
