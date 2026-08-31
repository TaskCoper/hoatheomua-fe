'use client'

import { emitPromoEvent } from '@/features/promotions/analytics'
import { PROMO_CLICK_EVENT } from '@/features/promotions/constants'
import { resolvePromoHref } from '@/features/promotions/href'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { decodeImageViewport } from '@/lib/image-viewport'
import ViewportImage from '@/shared/components/viewport-image'
import type { PromotionPopupItem } from '@/types/config.type'
import Image from 'next/image'
import { useMemo } from 'react'

interface PromotionSlideProps {
  campaign: PromotionPopupItem
  index: number
  onImageError: (id: string) => void
  onNavigate: () => void
}

// Negative offset keeps the focus ring inside the frame, which clips its children.
const LINK_CLASS = 'block focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-white'

const FRAME_CLASS = 'relative aspect-4/5 max-h-[85svh] w-full overflow-hidden bg-muted sm:max-h-[80vh]'

// Matches the foreground `sizes` so the backdrop reuses the same optimizer URL.
const IMAGE_SIZES = '(min-width: 452px) 420px, calc(100vw - 2rem)'

export default function PromotionSlide({ campaign, index, onImageError, onNavigate }: PromotionSlideProps) {
  const { t, locale } = useTranslation()

  // `window` is safe here: the popup is loaded with `ssr: false`.
  const target = useMemo(
    () => resolvePromoHref(campaign.href, typeof window === 'undefined' ? null : window.location.hostname),
    [campaign.href]
  )

  // A framed campaign has a region the author picked against this very 4:5 box, so it fills the
  // box - no bars to hide, and the blurred backdrop below would never show.
  const framing = useMemo(() => decodeImageViewport(campaign.image).viewport, [campaign.image])

  const alt = campaign.alt[locale] || campaign.alt.vi || t('promoPopup.imageAlt')

  const image = (
    <div className={FRAME_CLASS}>
      {framing ? (
        <ViewportImage
          src={campaign.image}
          alt={alt}
          className='object-cover'
          sizes={IMAGE_SIZES}
          // Never `priority`: it would compete with real LCP content.
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority='low'
          decoding='async'
          quality={75}
          onError={() => onImageError(campaign.id)}
        />
      ) : (
        <>
          {/* `object-contain` avoids cropping CMS artwork of arbitrary aspect ratio;
              the blurred copy fills the resulting bars instead of flat `bg-muted`. */}
          <Image
            src={campaign.image}
            alt=''
            aria-hidden
            fill
            className='scale-110 object-cover blur-2xl brightness-90 saturate-150'
            sizes={IMAGE_SIZES}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority='low'
            decoding='async'
            quality={75}
          />

          <Image
            src={campaign.image}
            alt={alt}
            fill
            className='object-contain drop-shadow-[0_2px_24px_rgb(0_0_0/0.28)]'
            sizes={IMAGE_SIZES}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority='low'
            decoding='async'
            quality={75}
            onError={() => onImageError(campaign.id)}
          />
        </>
      )}
    </div>
  )

  // No destination: render a plain, non-interactive image.
  if (target.kind === 'none') return image

  const handleClick = () => {
    // Emitted before `onNavigate` unmounts the popup, to avoid racing teardown.
    emitPromoEvent(PROMO_CLICK_EVENT, { id: campaign.id, href: campaign.href })
    onNavigate()
  }

  // Plain anchor: a new tab is a fresh load anyway, and this avoids next-intl
  // prefetching a tab the visitor may never open.
  if (campaign.openInNewTab) {
    return (
      <a
        href={campaign.href}
        target='_blank'
        rel={target.kind === 'external' ? 'noopener noreferrer nofollow' : 'noopener noreferrer'}
        onClick={handleClick}
        className={LINK_CLASS}
      >
        {image}
      </a>
    )
  }

  if (target.kind === 'internal') {
    return (
      <Link href={target.path} onClick={handleClick} className={LINK_CLASS}>
        {image}
      </Link>
    )
  }

  return (
    <a href={target.url} rel='noopener noreferrer nofollow' onClick={handleClick} className={LINK_CLASS}>
      {image}
    </a>
  )
}
