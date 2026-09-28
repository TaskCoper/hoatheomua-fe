'use client'

import { useProductVariant } from '@/features/products/components/product-variant-context'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

const DRAG_THRESHOLD_PX = 10

export default function ProductGallery() {
  const { t } = useTranslation()

  const { product, selectedId, selected } = useProductVariant()

  const name = product.productName ?? ''
  const categoryName = product.categoryName

  const retail = selected.price ?? 0
  const oldPrice = selected.oldPrice ?? 0
  const discountPercent = oldPrice > retail ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0

  const entries = useMemo(() => {
    // Cover leads so index 0 is always the default selection. Fall back to the
    // parent's cover so a variant with no images of its own still renders.
    const own = [selected.coverImage, ...(selected.otherImages ?? [])]
    const images = (own.some(Boolean) ? own : [product.coverImage]).filter((src): src is string => Boolean(src))
    return Array.from(new Set(images))
  }, [selected.coverImage, selected.otherImages, product.coverImage])

  const [imageIndex, setImageIndex] = useState(0)
  const [lastSelectedId, setLastSelectedId] = useState(selectedId)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })

  // Reset to the cover during render when the variant changes - no effect, so
  // the hero never paints the previous variant's image first.
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId)
    setImageIndex(0)
  }

  const activeIndex = Math.min(imageIndex, Math.max(entries.length - 1, 0))
  const hasMultiple = entries.length > 1

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setImageIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    if (emblaApi.selectedScrollSnap() !== activeIndex) emblaApi.scrollTo(activeIndex)
  }, [emblaApi, activeIndex])

  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, entries.length])

  const pressOrigin = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    pressOrigin.current = { x: event.clientX, y: event.clientY }
  }, [])

  const openLightbox = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    const origin = pressOrigin.current
    pressOrigin.current = null
    if (origin) {
      const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
      if (travelled > DRAG_THRESHOLD_PX) return
    }
    setIsLightboxOpen(true)
  }, [])

  const slides = useMemo(
    () =>
      entries.map((src, index) => ({
        src,
        alt: t('products.detail.gallery.thumbAlt', { name, index: index + 1 }),
        width: 1600,
        height: 1600
      })),
    [entries, name, t]
  )

  if (entries.length === 0) {
    return (
      <div className='flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-foreground/15 bg-muted text-sm text-muted-foreground sm:rounded-4xl'>
        {t('products.detail.gallery.emptyState')}
      </div>
    )
  }

  return (
    <div className='space-y-4 xl:space-y-3'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-2'>
        {hasMultiple ? (
          <div
            className={cn(
              'rail-x order-2 hidden w-full items-center justify-start gap-4 p-1 sm:flex',
              'xl:order-1 xl:w-24 xl:flex-col xl:items-stretch xl:gap-3 xl:overflow-x-hidden xl:overflow-y-auto xl:p-1.5'
            )}
          >
            {entries.map((src, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={src}
                  type='button'
                  onClick={() => setImageIndex(index)}
                  aria-label={t('products.detail.gallery.viewImage', { index: index + 1 })}
                  aria-pressed={isActive}
                  className={cn(
                    'relative size-16 shrink-0 overflow-hidden rounded-xl opacity-50 transition-opacity duration-300 hover:opacity-100 sm:size-24 sm:rounded-2xl xl:size-20',
                    isActive ? 'opacity-100 ring-2 ring-primary ring-offset-1' : ''
                  )}
                >
                  <Image
                    src={src}
                    alt={t('products.detail.gallery.thumbAlt', { name, index: index + 1 })}
                    fill
                    sizes='(min-width: 1280px) 5rem, 6rem'
                    quality={55}
                    className='object-cover'
                  />
                </button>
              )
            })}
          </div>
        ) : null}

        <div className='relative order-1 xl:order-2 xl:flex-1'>
          <div ref={emblaRef} className='overflow-hidden rounded-2xl sm:rounded-4xl xl:rounded-3xl'>
            <div className='flex touch-pan-y'>
              {entries.map((src, index) => (
                <button
                  key={src}
                  type='button'
                  onPointerDown={handlePointerDown}
                  onClick={openLightbox}
                  aria-label={t('products.detail.gallery.openLightbox')}
                  className='group relative aspect-square w-full flex-[0_0_100%] cursor-zoom-in'
                >
                  <Image
                    src={src}
                    alt={index === 0 ? name : t('products.detail.gallery.thumbAlt', { name, index: index + 1 })}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes='(min-width: 1280px) 40rem, (min-width: 1024px) 32rem, 100vw'
                    quality={70}
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </button>
              ))}
            </div>
          </div>

          {discountPercent > 0 ? (
            <span className='pointer-events-none absolute top-3 left-3 inline-flex rounded-full bg-rose-500 px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-white uppercase shadow-sm'>
              -{discountPercent}%
            </span>
          ) : null}
          {categoryName ? (
            <span className='pointer-events-none absolute top-3 right-3 inline-flex max-w-[60%] truncate rounded-full bg-card/95 px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-primary uppercase shadow-sm ring-1 ring-foreground/5'>
              {categoryName}
            </span>
          ) : null}

          {hasMultiple ? (
            <span
              aria-hidden='true'
              className='pointer-events-none absolute right-3 bottom-3 rounded-full bg-foreground/60 px-2.5 py-1 text-[0.6875rem] font-semibold text-background tabular-nums backdrop-blur-sm sm:hidden'
            >
              {activeIndex + 1} / {entries.length}
            </span>
          ) : null}
        </div>
      </div>

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        index={activeIndex}
        on={{
          view: ({ index }) => setImageIndex(index)
        }}
        slides={slides}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        carousel={{ finite: entries.length <= 1 }}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      />
    </div>
  )
}
