'use client'

import { useBannerBySlot } from '@/hooks/use-banner-by-slot'
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
  sizes?: string
  quality?: number
}

export default function ConfigurableBanner({
  slot,
  fallbackSrc,
  fallbackAlt,
  className,
  sizes,
  quality = 65
}: ConfigurableBannerProps) {
  const { locale } = useTranslation()
  const banner = useBannerBySlot(slot)

  const image: ReactNode = banner ? (
    <Image
      src={banner.image}
      alt={banner.alt[locale] || fallbackAlt}
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

  if (!banner?.href) return image

  const externalRel = banner.openInNewTab ? 'noopener noreferrer' : undefined
  const externalTarget = banner.openInNewTab ? '_blank' : undefined
  const isInternal = banner.href.startsWith('/')

  return isInternal ? (
    <Link href={banner.href} target={externalTarget} rel={externalRel} className='block'>
      {image}
    </Link>
  ) : (
    <a href={banner.href} target={externalTarget} rel={externalRel} className='block'>
      {image}
    </a>
  )
}
