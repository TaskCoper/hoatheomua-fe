import RichTextBody from '@/components/rich-text-body'
import { sanitizeRichText } from '@/lib/sanitize'

interface SanitizedHtmlProps {
  /** The raw HTML string to be sanitized and displayed. */
  html: string
  /** Optional class names to apply to the root element. */
  className?: string
  /** Optional element type to render as (e.g., 'div', 'article'). Defaults to 'div'. */
  as?: keyof React.JSX.IntrinsicElements
}

/**
 * Server component. Sanitising here rather than in the browser keeps the `xss`
 * filter out of the client bundle and off the hydration path - on a long
 * article that parse was pure main-thread cost for markup the server had
 * already produced. Only `RichTextBody`'s link delegation ships as client JS.
 *
 * Client components can't render this; they should call `sanitizeRichText`
 * themselves and render `RichTextBody` directly.
 */
export default function SanitizedHtml({ html, className, as }: SanitizedHtmlProps) {
  return <RichTextBody html={sanitizeRichText(html)} className={className} as={as} />
}
