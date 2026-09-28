'use client'

import Image, { type ImageProps } from 'next/image'
import { useState, type ReactNode } from 'react'

type ThumbnailImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string | null | undefined
  /** Stands in when there is no image, and when the one there is refuses to load. */
  fallback: ReactNode
}

/**
 * A product thumbnail that degrades to its placeholder instead of to alt text.
 *
 * Catalogue rows outlive the files they point at - a cover image deleted upstream still
 * comes back on the product, the order and the cart line - and a bare `next/image` answers
 * that by painting the alt text across the frame, which reads as a broken page rather than
 * a missing photo.
 *
 * The failed `src` is remembered rather than a flag, so a row reused for another product
 * (a virtualised list, a re-sorted cart) tries the new image instead of inheriting a
 * verdict passed on the last one.
 */
export function ThumbnailImage({ src, alt, fallback, ...props }: ThumbnailImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || src === failedSrc) return <>{fallback}</>

  return <Image src={src} alt={alt} {...props} onError={() => setFailedSrc(src)} />
}
