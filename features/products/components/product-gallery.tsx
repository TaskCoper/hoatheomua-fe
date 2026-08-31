'use client'

import { useProductVariant } from '@/features/products/components/product-variant-context'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

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

  // Reset to the cover during render when the variant changes - no effect, so
  // the hero never paints the previous variant's image first.
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId)
    setImageIndex(0)
  }

  const activeIndex = Math.min(imageIndex, Math.max(entries.length - 1, 0))
  const activeImage = entries[activeIndex] ?? null
  const hasThumbnails = entries.length > 1

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

  if (!activeImage) {
    return (
      <div className='flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-foreground/15 bg-muted text-sm text-muted-foreground sm:rounded-4xl'>
        {t('products.detail.gallery.emptyState')}
      </div>
    )
  }

  return (
    <div className='space-y-4 xl:space-y-3'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-2'>
        {hasThumbnails ? (
          <div
            className={cn(
              'order-2 flex w-full items-center justify-start gap-4 overflow-x-auto p-1',
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
                    'relative size-16 sm:size-24 xl:size-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl opacity-50 transition-opacity duration-300 hover:opacity-100',
                    isActive ? 'opacity-100 ring-2 ring-primary ring-offset-1' : ''
                  )}
                >
                  <Image
                    src={src}
                    alt={t('products.detail.gallery.thumbAlt', { name, index: index + 1 })}
                    fill
                    sizes='(min-width: 1280px) 5rem, (min-width: 640px) 6rem, 4rem'
                    quality={55}
                    className='object-cover'
                  />
                </button>
              )
            })}
          </div>
        ) : null}

        <button
          type='button'
          onClick={() => setIsLightboxOpen(true)}
          aria-label={t('products.detail.gallery.openLightbox')}
          className='group relative order-1 aspect-square w-full overflow-hidden rounded-2xl sm:rounded-4xl xl:order-2 xl:flex-1 xl:rounded-3xl cursor-zoom-in'
        >
          <Image
            src={activeImage}
            alt={name}
            fill
            priority
            fetchPriority='high'
            sizes='(min-width: 1280px) 40rem, (min-width: 1024px) 32rem, 100vw'
            quality={70}
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
          {discountPercent > 0 ? (
            <span className='absolute left-3 top-3 inline-flex rounded-full bg-rose-500 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-white shadow-sm'>
              -{discountPercent}%
            </span>
          ) : null}
          {categoryName ? (
            <span className='absolute right-3 top-3 inline-flex rounded-full bg-card/95 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-primary shadow-sm ring-1 ring-foreground/5'>
              {categoryName}
            </span>
          ) : null}
        </button>
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
