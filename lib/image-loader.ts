import type { ImageLoaderProps } from 'next/image'

/**
 * Custom `next/image` loader that resizes through wsrv.nl instead of Vercel's
 * `/_next/image`.
 *
 * Vercel's optimizer is metered, and once the transformation allowance runs out
 * it answers every request with `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` -
 * not a smaller image, not the original, an error. Every remote image on the
 * site goes blank, and anything wired to `onError` reacts to it: the promotional
 * popup treats "all artwork failed" as a reason to close itself, so it appeared
 * and vanished a moment later.
 *
 * Neither origin CDN resizes on its own (`pos.nvncdn.com` and the BizFly bucket
 * both ignore `w`/`width` and hand back the original), so serving `src` straight
 * through would mean 600 KB product JPEGs on every card. wsrv.nl is a free
 * Cloudflare-fronted proxy that does the resize and the webp encode for us, with
 * no quota to exhaust.
 */

/** Same-origin and inline sources: nothing to proxy, and localhost isn't reachable from wsrv. */
const isProxyable = (src: string) => src.startsWith('http://') || src.startsWith('https://')

// Safari 14 and Chrome 87 both decode webp, which is the floor in `browserslist`.
// AVIF would be smaller still, but wsrv encodes it slowly enough to cost more in
// TTFB on a cache miss than it saves in bytes.
const OUTPUT_FORMAT = 'webp'

const DEFAULT_QUALITY = 75

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!isProxyable(src)) {
    // Served as-is: static imports are already sized and encoded at build time, and
    // `/public` assets have no upstream to resize. The width still has to appear in
    // the URL - `next/image` calls the loader twice and warns when the result is
    // width-invariant. Next's static handler ignores the extra query param.
    return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
  }

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? DEFAULT_QUALITY),
    output: OUTPUT_FORMAT
  })

  // `we` = "without enlargement": an origin narrower than the requested width is
  // returned at its own size rather than upscaled into a blurry, bigger file.
  return `https://wsrv.nl/?${params.toString()}&we`
}
