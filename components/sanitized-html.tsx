'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import DOMPurify from 'isomorphic-dompurify'
import { useMemo, type MouseEvent } from 'react'

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

  const finalHtml = useMemo(() => {
    const cleanHtml = DOMPurify.sanitize(html, PURIFY_CONFIG).replace(
      / (style|class|bgcolor|color|align|face|size)="[^"]*"/gi,
      ''
    )

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return cleanHtml
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanHtml, 'text/html')

    const STRIP_ATTRS = ['style', 'class', 'bgcolor', 'color', 'align', 'face', 'size']
    doc.body.querySelectorAll('*').forEach((el) => {
      STRIP_ATTRS.forEach((attr) => el.removeAttribute(attr))
    })

    doc.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer')
    })

    const isEmptyBlock = (el: Element | null) => {
      if (!el || el.tagName !== 'P') return false
      if (el.querySelector('img, iframe, video, audio, picture, svg')) return false
      return (el.textContent ?? '').replace(/ /g, ' ').trim() === ''
    }
    while (isEmptyBlock(doc.body.lastElementChild)) {
      doc.body.lastElementChild!.remove()
    }

    return doc.body.innerHTML
  }, [html])

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

  const ElementType = Component as keyof React.JSX.IntrinsicElements

  return (
    <ElementType
      onClick={handleContainerClick}
      className={cn('hth-rich-text', className)}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  )
}
