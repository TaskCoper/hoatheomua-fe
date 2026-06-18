'use client'

import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import DOMPurify from 'dompurify'
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
    'strong',
    'em',
    'u',
    's',
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
    'span'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'data-type'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload']
}

export default function SanitizedHtml({ html, className, as: Component = 'div' }: SanitizedHtmlProps) {
  const router = useRouter()

  const finalHtml = useMemo(() => {
    const cleanHtml = DOMPurify.sanitize(html, PURIFY_CONFIG)

    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanHtml, 'text/html')

    doc.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer')
    })

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
      className={cn(
        'tiptap ProseMirror prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl overflow-auto',
        'prose-pre:whitespace-pre-wrap prose-pre:break-words wrap-break-word',
        className
      )}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  )
}
