'use client'

import NextImage from 'next/image'
import { useState, type ReactNode } from 'react'

interface DecorImageProps {
  /** Path under /public, e.g. "/images/about/hero-hanoi-wash.png". */
  src: string
  alt?: string
  /** Classes for the <Image> itself - positioning, object-fit, opacity, etc. */
  className?: string
  sizes?: string
  /** Must be one of next.config images.qualities ([50, 55, 65, 70, 75]). */
  quality?: 50 | 55 | 65 | 70 | 75
  priority?: boolean
  /** Rendered when the source is missing or fails to load. Defaults to nothing. */
  fallback?: ReactNode
}

/**
 * About-page art (see /about-page-image-brief.md) is generated externally and
 * dropped into /public/images/about/ later. Until a file exists its request 404s;
 * DecorImage swallows that and renders `fallback` instead of a broken-image icon.
 * Once the PNG lands it loads and covers the fallback. The build is unaffected
 * because `src` is a runtime string path, not a static import (which would fail to
 * resolve at compile time while the file is absent).
 *
 * The image is `fill`-positioned, so the caller must give it a `relative` container
 * (often the existing panel/initials chip the art sits over, which is what shows
 * through as the fallback).
 */
export default function DecorImage({
  src,
  alt = '',
  className,
  sizes = '100vw',
  quality,
  priority,
  fallback = null
}: DecorImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) return <>{fallback}</>

  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
