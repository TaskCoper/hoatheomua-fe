'use client'

import { bannerAspectForSlot, resolveBannerImage, useBannerSlot } from '@/hooks/use-banner-by-slot'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { decodeImageViewport } from '@/lib/image-viewport'
import ViewportImage from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { type BannerSlot } from '@/types/config.type'
import Image, { type StaticImageData } from 'next/image'
import { type ReactNode } from 'react'

type ConfigurableBannerProps = {
  slot: BannerSlot
  fallbackSrc: StaticImageData
  fallbackAlt: string
  className?: string
  wrapperClassName?: string
  sizes?: string
  quality?: number
}

export default function ConfigurableBanner({
  slot,
  fallbackSrc,
  fallbackAlt,
  className,
  wrapperClassName,
  sizes,
  quality = 65
}: ConfigurableBannerProps) {
  const { locale } = useTranslation()
  const state = useBannerSlot(slot)

  if (state.status === 'hidden') return null

  const banner = state.status === 'banner' ? state.banner : undefined

  const bannerHref = typeof banner?.href === 'string' ? banner.href.trim() : undefined
  const openInNewTab = banner?.openInNewTab === true

  const alt = banner?.alt[locale] || fallbackAlt

  const stored = resolveBannerImage(banner?.image, locale)
  const { src, viewport } = decodeImageViewport(stored)

  // A banner normally renders at its own aspect (`w-full h-auto`). A framed one can't: the author
  // chose a region against this slot's shape, so the slot has to reserve that shape and crop to it.
  const image: ReactNode = !src ? (
    <Image src={fallbackSrc} alt={alt} className={className} sizes={sizes} loading='lazy' quality={quality} />
  ) : viewport ? (
    <span
      className={cn('relative block w-full overflow-hidden', className)}
      style={{ aspectRatio: bannerAspectForSlot(slot) }}
    >
      <ViewportImage src={stored} alt={alt} className='object-cover' sizes={sizes} loading='lazy' quality={quality} />
    </span>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={fallbackSrc.width}
      height={fallbackSrc.height}
      className={className}
      sizes={sizes}
      loading='lazy'
      quality={quality}
    />
  )

  const content = !bannerHref ? (
    image
  ) : bannerHref.startsWith('/') ? (
    <Link
      href={bannerHref}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className='block'
    >
      {image}
    </Link>
  ) : (
    <a
      href={bannerHref}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className='block'
    >
      {image}
    </a>
  )

  return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content
}
