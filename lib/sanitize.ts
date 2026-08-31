import { FilterXSS } from 'xss'

const ALLOWED_TAGS = [
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
]

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'colspan',
  'rowspan',
  'align',
  'data-type'
]

// `xss` drops `javascript:` / `data:` URLs on href+src and escapes anything it
// does not recognise. `stripIgnoreTagBody` additionally discards the *contents*
// of these tags rather than leaking them as visible text.
const filter = new FilterXSS({
  whiteList: Object.fromEntries(ALLOWED_TAGS.map((tag) => [tag, ALLOWED_ATTR])),
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'noscript']
})

// The editor emits presentational attributes that fight the prose styles. They
// are allow-listed above only so the markup survives parsing; they are removed
// here so the article inherits the site's typography.
const PRESENTATION_ATTR = / (style|class|bgcolor|color|align|face|size)="[^"]*"/gi

// `xss` normalises every surviving attribute to double quotes, so these run
// against a predictable shape rather than arbitrary editor output.
const BLANK_TARGET_ANCHOR = /<a\b(?![^>]*\brel=)([^>]*\btarget="_blank"[^>]*)>/gi

// Editors habitually leave a run of empty paragraphs at the end of a document,
// which render as dead whitespace under the article.
const TRAILING_EMPTY_BLOCK = /(?:<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+$/i

/**
 * Sanitises editor HTML and normalises it for display.
 *
 * Deliberately DOM-free: this is the whole pipeline, so it produces identical
 * output on the server and in the browser and callers can run it during SSR.
 * It replaces an earlier `useEffect` that walked every node after mount to do
 * the same three jobs - stripping presentational attributes, hardening
 * `target="_blank"` links, and trimming trailing empty blocks - which meant a
 * full DOM traversal of every article on hydration.
 */
export const sanitizeRichText = (html: string) =>
  filter
    .process(html)
    .replace(PRESENTATION_ATTR, '')
    .replace(BLANK_TARGET_ANCHOR, '<a$1 rel="noopener noreferrer">')
    .replace(TRAILING_EMPTY_BLOCK, '')
