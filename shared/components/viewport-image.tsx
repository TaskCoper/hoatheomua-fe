'use client'

import { useElementSize } from '@/hooks/use-element-size'
import { decodeImageViewport, resolveViewportLayout, type ImageViewport } from '@/lib/image-viewport'
import { cn } from '@/shared/utils'
import Image, { type ImageProps } from 'next/image'
import { useCallback, useMemo, useState, type CSSProperties, type ReactEventHandler } from 'react'

type NaturalSize = { width: number; height: number }

export type ImageFrame = {
  /** `ref` for the element the framing is resolved against - the box the image has to cover. */
  attachBox: (element: HTMLElement | null) => void
  /** `ref` for the `<img>` itself; reads the natural size of an image that is already complete. */
  attachImage: (image: HTMLImageElement | null) => void
  /** `src` with its `#iv=` token removed - what the loader and the SEO layer should see. */
  src: string
  viewport: ImageViewport | null
  /** True once the framing is actually being applied; false while the `object-cover` fallback shows. */
  framed: boolean
  /** Absolute placement for the `<img>`, or `undefined` while falling back. */
  style: CSSProperties | undefined
  onLoad: ReactEventHandler<HTMLImageElement>
  /** Multiplier the framing applies to the rendered width - feed it to `scaleSizes`. */
  sizeFactor: number
}

/**
 * Resolves the framing stored in an image URL's `#iv=` fragment into an absolute placement inside
 * the element `attachBox` is attached to, per `docs/image-viewport.md` in the admin repo (the
 * shared contract).
 *
 * Falls back to whatever the caller already renders (plain `object-cover`) until the container is
 * measured and the image's natural size is known - so an unframed, malformed or still-loading
 * image behaves exactly as it did before.
 *
 * Prefer `<ViewportImage>`; reach for the hook only where the `<img>` is owned by something else
 * (a Radix `Avatar.Image`, a bare `<img>`).
 */
export function useImageFrame(src: string | null | undefined): ImageFrame {
  // The box lives in state, not a ref: the layout has to recompute once it mounts, and a ref read
  // during render is exactly what `react-hooks/refs` forbids.
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [natural, setNatural] = useState<NaturalSize | null>(null)
  const [measuredSrc, setMeasuredSrc] = useState('')

  const decoded = useMemo(() => decodeImageViewport(src), [src])
  const { width: containerWidth, height: containerHeight } = useElementSize(container)

  // Reset during render, not in an effect, so a new `src` never paints a frame with the previous
  // image's aspect.
  if (measuredSrc !== decoded.src) {
    setMeasuredSrc(decoded.src)
    setNatural(null)
  }

  // Idempotent, and stable across renders: a callback ref that changed identity would be re-run on
  // every render, and a fresh object each time would loop it against its own re-render.
  const applyNatural = useCallback((image: HTMLImageElement) => {
    if (image.naturalWidth <= 0) return

    setNatural((prev) =>
      prev && prev.width === image.naturalWidth && prev.height === image.naturalHeight
        ? prev
        : { width: image.naturalWidth, height: image.naturalHeight }
    )
  }, [])

  // A cached or reused image can already be complete before any load event would fire for it.
  const attachImage = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete) applyNatural(image)
    },
    [applyNatural]
  )

  const onLoad = useCallback<ReactEventHandler<HTMLImageElement>>(
    (event) => applyNatural(event.currentTarget),
    [applyNatural]
  )

  const layout = useMemo(() => {
    if (!decoded.viewport || !natural) return null

    return resolveViewportLayout({
      viewport: decoded.viewport,
      containerWidth,
      containerHeight,
      naturalWidth: natural.width,
      naturalHeight: natural.height
    })
  }, [decoded.viewport, natural, containerWidth, containerHeight])

  return {
    attachBox: setContainer,
    attachImage,
    src: decoded.src,
    viewport: decoded.viewport,
    framed: layout !== null,
    style: layout ? { left: layout.left, top: layout.top, width: layout.width, height: layout.height } : undefined,
    onLoad,
    // Known from the URL alone, so it is stable between server and client.
    sizeFactor: decoded.viewport ? 100 / decoded.viewport.w : 1
  }
}

// A bare length: `320px`, `24rem`, `100vw`, `50%`. Anything more involved is left alone rather
// than risk emitting a `sizes` the browser throws away wholesale.
const PLAIN_LENGTH = /^-?[\d.]+(px|rem|em|vw|vh|vmin|vmax|ch|ex|%)$/

/**
 * Widens a `sizes` attribute by `factor`. A framed image is rendered larger than its box - it
 * overflows by design - so the unscaled `sizes` would have the browser pick a candidate that is
 * then upscaled. Capped, because a tiny region should not pull down a 4k source.
 */
export const scaleSizes = (sizes: string | undefined, factor: number): string | undefined => {
  if (!sizes || !Number.isFinite(factor) || factor <= 1.05) return sizes

  const scale = Math.min(factor, 3)

  return sizes
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim()
      // `(min-width: 640px) 24rem` - split the media condition off its length.
      const split = trimmed.startsWith('(') ? trimmed.lastIndexOf(')') + 1 : 0
      const condition = trimmed.slice(0, split)
      const length = trimmed.slice(split).trim()

      if (!PLAIN_LENGTH.test(length)) return trimmed

      return `${condition}${condition ? ' ' : ''}calc(${length} * ${scale.toFixed(2)})`
    })
    .join(', ')
}

export type ViewportImageProps = Omit<ImageProps, 'fill' | 'width' | 'height' | 'ref' | 'onLoad'> & {
  /** Applied to the measured box. Defaults to filling the nearest positioned ancestor. */
  frameClassName?: string
  frameStyle?: CSSProperties
}

/**
 * `next/image` in `fill` mode that honours the framing carried in `src`'s `#iv=` fragment.
 *
 * Drop-in for `<Image fill className='object-cover' />` inside a `relative overflow-hidden` box:
 * the box the framing is resolved against is a `<span>` that covers that same area, so siblings
 * (gradients, badges) keep their position and order.
 */
export default function ViewportImage({
  src,
  className,
  sizes,
  style,
  frameClassName,
  frameStyle,
  alt,
  ...rest
}: ViewportImageProps) {
  // Destructured, not read off an object: `react-hooks/refs` marks a whole hook result as a ref
  // once one of its members is used as a `ref`.
  const {
    attachBox,
    attachImage,
    src: framedSrc,
    viewport,
    framed,
    style: framedStyle,
    onLoad,
    sizeFactor
  } = useImageFrame(typeof src === 'string' ? src : null)

  return (
    <span ref={attachBox} className={cn('absolute inset-0 overflow-hidden', frameClassName)} style={frameStyle}>
      {/* The framing sizes this span, not the `<img>`: `fill` refuses a `style.width`/`style.height`
          of its own (it throws in dev), so the image fills a box that overflows instead. */}
      <span className={cn('absolute', !framed && 'inset-0')} style={framedStyle}>
        <Image
          {...rest}
          src={typeof src === 'string' ? framedSrc : src}
          alt={alt}
          fill
          // Widened from the first render, not once framing lands, so the browser picks the right
          // candidate in one request instead of re-fetching a larger one after load.
          sizes={viewport ? scaleSizes(sizes, sizeFactor) : sizes}
          className={className}
          style={style}
          ref={attachImage}
          onLoad={onLoad}
        />
      </span>
    </span>
  )
}
