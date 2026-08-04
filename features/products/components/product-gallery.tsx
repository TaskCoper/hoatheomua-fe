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
  // Each variant carries its own cover image; the gallery follows the shared
  // selection so switching a variant (here or in the purchase box) swaps the
  // hero image, and thumbnails double as the variant switcher.
  const { product, hasVariants, variants, selectedId, selected, setSelectedId } = useProductVariant()

  const name = product.productName ?? ''
  const categoryName = product.categoryName

  const retail = selected.price ?? 0
  const oldPrice = selected.oldPrice ?? 0
  const discountPercent = oldPrice > retail ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0

  // One entry per selectable row: variants when present, else the parent.
  const entries = useMemo(() => {
    const source = hasVariants ? variants : [product]
    return source
      .map((item) => ({ id: item.id, src: item.coverImage }))
      .filter((entry): entry is { id: string; src: string } => Boolean(entry.src))
  }, [hasVariants, variants, product])

  const [localIndex, setLocalIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const selectedIndex = entries.findIndex((entry) => entry.id === selectedId)
  const activeIndex = hasVariants ? (selectedIndex >= 0 ? selectedIndex : 0) : Math.min(localIndex, entries.length - 1)

  const select = (index: number) => {
    const entry = entries[index]
    if (!entry) return
    if (hasVariants) setSelectedId(entry.id)
    else setLocalIndex(index)
  }

  const activeImage = selected.coverImage ?? entries[activeIndex]?.src ?? product.coverImage ?? null
  const hasThumbnails = entries.length > 1

  const slides = useMemo(
    () =>
      entries.map((entry, index) => ({
        src: entry.src,
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
            {entries.map((entry, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={entry.id}
                  type='button'
                  onClick={() => select(index)}
                  aria-label={t('products.detail.gallery.viewImage', { index: index + 1 })}
                  aria-pressed={isActive}
                  className={cn(
                    'relative size-16 sm:size-24 xl:size-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl opacity-50 transition-opacity duration-300 hover:opacity-100',
                    isActive ? 'opacity-100 ring-2 ring-primary ring-offset-1' : ''
                  )}
                >
                  <Image
                    src={entry.src}
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
          view: ({ index }) => select(index)
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
