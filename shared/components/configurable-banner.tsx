'use client'

import { useBannerSlot } from '@/hooks/use-banner-by-slot'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
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
  // CMS records can be enabled before an image has been uploaded. Treat blank
  // sources as absent so Next/Image receives the local fallback instead.
  const bannerImage = typeof banner?.image === 'string' ? banner.image.trim() : undefined
  const bannerHref = typeof banner?.href === 'string' ? banner.href.trim() : undefined
  const openInNewTab = banner?.openInNewTab === true

  const image: ReactNode = bannerImage ? (
    <Image
      src={bannerImage}
      alt={banner?.alt[locale] || fallbackAlt}
      width={fallbackSrc.width}
      height={fallbackSrc.height}
      className={className}
      sizes={sizes}
      loading='lazy'
      quality={quality}
    />
  ) : (
    <Image src={fallbackSrc} alt={fallbackAlt} className={className} sizes={sizes} loading='lazy' quality={quality} />
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
