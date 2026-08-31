'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/shared/utils'
import type { MouseEvent } from 'react'

interface RichTextBodyProps {
  /** Already sanitised markup - run it through `sanitizeRichText` first. */
  html: string
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

/**
 * The only part of a rich-text article that needs to be interactive: internal
 * links are delegated to the client router so they behave like the rest of the
 * app instead of triggering a full page load.
 *
 * Sanitising happens upstream so this stays a leaf island - the `xss` filter
 * and the markup normalisation never reach the browser on server-rendered
 * routes.
 */
export default function RichTextBody({ html, className, as: Component = 'div' }: RichTextBodyProps) {
  const router = useRouter()

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
      onClick={handleContainerClick}
      className={cn('hth-rich-text', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
