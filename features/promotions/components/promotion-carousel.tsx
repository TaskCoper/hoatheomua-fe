'use client'

import { emitPromoEvent } from '@/features/promotions/analytics'
import PromotionSlide from '@/features/promotions/components/promotion-slide'
import { PROMO_IMPRESSION_EVENT } from '@/features/promotions/constants'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import useEmblaCarousel from 'embla-carousel-react'
import type { PromotionPopupItem } from '@/types/config.type'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

interface PromotionCarouselProps {
  campaigns: readonly PromotionPopupItem[]
  onImageError: (id: string) => void
  onNavigate: () => void
}

// Dark glass avoids the arrows disappearing on light artwork; hidden until hover.
const NAV_BUTTON_CLASS =
  'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 shadow-lg transition duration-200 supports-backdrop-filter:backdrop-blur-md hover:bg-black/55 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none group-hover:opacity-100 lg:inline-flex'

let reducedMotionQuery: MediaQueryList | null = null

const getReducedMotionQuery = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return null
  reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)')
  return reducedMotionQuery
}

const subscribeToReducedMotion = (onChange: () => void) => {
  const query = getReducedMotionQuery()
  query?.addEventListener('change', onChange)

  return () => query?.removeEventListener('change', onChange)
}

/** Avoids a first-paint flash of the wrong value vs. reading matchMedia in an effect. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => getReducedMotionQuery()?.matches ?? false,
    () => false
  )
}

export default function PromotionCarousel({ campaigns, onImageError, onNavigate }: PromotionCarouselProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isCarousel = campaigns.length > 1

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: isCarousel,
    align: 'center',
    // No autoplay: auto-advancing a clickable surface causes mis-clicks.
    duration: prefersReducedMotion ? 0 : 25,
    watchDrag: isCarousel
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const seenRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  // Document-level: focus may be on the close button, a dot, or the image link.
  useEffect(() => {
    if (!emblaApi || !isCarousel) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        emblaApi.scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        emblaApi.scrollNext()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [emblaApi, isCarousel])

  // One impression per campaign per mount, to avoid inflating counts.
  useEffect(() => {
    const campaign = campaigns[selectedIndex]
    if (!campaign || seenRef.current.has(campaign.id)) return

    seenRef.current.add(campaign.id)
    emitPromoEvent(PROMO_IMPRESSION_EVENT, { id: campaign.id, index: selectedIndex })
  }, [campaigns, selectedIndex])

  return (
    <div role='group' aria-roledescription={t('promoPopup.carousel')} aria-label={t('promoPopup.title')}>
      {/* `group` reveals the arrows on hover. */}
      <div className='group relative'>
        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex'>
            {campaigns.map((campaign, index) => (
              <div key={campaign.id} className='min-w-0 shrink-0 grow-0 basis-full'>
                <PromotionSlide
                  campaign={campaign}
                  index={index}
                  onImageError={onImageError}
                  onNavigate={onNavigate}
                />
              </div>
            ))}
          </div>
        </div>

        {isCarousel && (
          <>
            <button
              type='button'
              aria-label={t('promoPopup.previous')}
              onClick={() => emblaApi?.scrollPrev()}
              className={cn(NAV_BUTTON_CLASS, 'left-2')}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className='size-5' />
            </button>

            <button
              type='button'
              aria-label={t('promoPopup.next')}
              onClick={() => emblaApi?.scrollNext()}
              className={cn(NAV_BUTTON_CLASS, 'right-2')}
            >
              <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className='size-5' />
            </button>

            {/* Floated over the artwork so the popup reads as one image card. */}
            <div className='absolute inset-x-0 bottom-3 z-10 flex justify-center'>
              <div className='flex items-center gap-1 rounded-full bg-black/30 px-2 shadow-md supports-backdrop-filter:backdrop-blur-md'>
                {campaigns.map((campaign, index) => (
                  <button
                    key={campaign.id}
                    type='button'
                    aria-label={t('promoPopup.goToSlide', { index: index + 1 })}
                    aria-current={index === selectedIndex}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className='inline-grid h-7 place-items-center rounded-full px-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white'
                  >
                    <span
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === selectedIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* A live region on the image track itself would announce nothing useful. */}
      <span aria-live='polite' aria-atomic='true' className='sr-only'>
        {t('promoPopup.slideStatus', { index: selectedIndex + 1, total: campaigns.length })}
      </span>

    </div>
  )
}
