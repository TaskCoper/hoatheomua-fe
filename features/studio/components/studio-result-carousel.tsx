'use client'

import StudioImage from '@/features/studio/components/studio-image'
import type { StudioProduct, StudioVersion } from '@/features/studio/types'
import DownloadImageButton from '@/shared/components/download-image-button'
import { cn } from '@/shared/utils'
import { ArrowLeft02Icon, ArrowRight02Icon, FullScreenIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import useEmblaCarousel from 'embla-carousel-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

const glassClass = 'bg-white/70 text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'
const arrowClass =
  'flex size-9 cursor-pointer items-center justify-center rounded-full transition-opacity duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-0'

interface StudioResultCarouselProps {
  versions: StudioVersion[]
  activeId: string
  product: StudioProduct
  onSelect: (version: StudioVersion) => void
}

export default function StudioResultCarousel({ versions, activeId, product, onSelect }: StudioResultCarouselProps) {
  const t = useTranslations('studio.versions')
  const tStudio = useTranslations('studio')
  const tPreview = useTranslations('studio.preview')
  const multiple = versions.length > 1
  const activeIndex = Math.max(
    versions.findIndex((item) => item.id === activeId),
    0
  )

  const [initialIndex] = useState(activeIndex)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    duration: 26,
    startIndex: initialIndex,
    watchDrag: multiple
  })

  useEffect(() => {
    if (!emblaApi) return

    const onEmblaSelect = () => {
      const version = versions[emblaApi.selectedScrollSnap()]
      if (version && version.id !== activeId) onSelect(version)
    }

    emblaApi.on('select', onEmblaSelect)
    return () => {
      emblaApi.off('select', onEmblaSelect)
    }
  }, [emblaApi, versions, activeId, onSelect])

  const zoomable = useMemo(() => versions.filter((version) => version.imageUrl), [versions])
  const slides = useMemo(
    () =>
      zoomable.map((version) => ({
        src: version.imageUrl as string,
        alt: tPreview('mockupSceneAlt', { product: product.name, mockup: version.mockupName }),
        title: version.name,
        description: version.mockupName
      })),
    [zoomable, product.name, tPreview]
  )

  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const openLightbox = useCallback(
    (version: StudioVersion | undefined) => {
      if (!version) return
      const index = zoomable.findIndex((item) => item.id === version.id)
      if (index >= 0) setLightboxIndex(index)
    },
    [zoomable]
  )

  const activeVersion = versions[activeIndex]

  useEffect(() => {
    if (!emblaApi) return

    const sync = () => {
      if (emblaApi.selectedScrollSnap() !== activeIndex) emblaApi.scrollTo(activeIndex)
    }

    sync()
    emblaApi.on('reInit', sync)
    return () => {
      emblaApi.off('reInit', sync)
    }
  }, [emblaApi, activeIndex])

  return (
    <>
      <div ref={emblaRef} className='absolute inset-0 overflow-hidden' aria-label={t('ariaLabel')} role='group'>
        <div className='flex h-full'>
          {versions.map((version, index) => (
            <div
              key={version.id}
              role='group'
              aria-roledescription='slide'
              aria-label={t('slideAriaLabel', { index: version.label, name: version.name, mockup: version.mockupName })}
              className='relative h-full min-w-0 flex-[0_0_100%]'
            >
              <StudioImage
                src={version.imageUrl}
                alt={tPreview('mockupSceneAlt', { product: product.name, mockup: version.mockupName })}
                fill
                sizes='(min-width: 1024px) 60vw, 100vw'
                loading={index === activeIndex ? 'eager' : 'lazy'}
                className='object-cover brightness-[0.88]'
                pendingLabel={tStudio('imagePending')}
                pendingIconClassName='size-12'
              />

              {version.imageUrl ? (
                <button
                  type='button'
                  onClick={() => openLightbox(version)}
                  aria-label={t('openLightbox', { name: version.name })}
                  className='absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white'
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className='absolute right-5 top-5 z-10 flex items-center gap-2 sm:right-8 sm:top-8 lg:right-10 lg:top-10'>
        {multiple ? (
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums', glassClass)}>
            {t('counter', { index: activeIndex + 1, total: versions.length })}
          </span>
        ) : null}

        {activeVersion?.imageUrl ? (
          <button
            type='button'
            onClick={() => openLightbox(activeVersion)}
            aria-label={t('openLightbox', { name: activeVersion.name })}
            title={t('openLightbox', { name: activeVersion.name })}
            className={cn(
              'flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              glassClass
            )}
          >
            <HugeiconsIcon icon={FullScreenIcon} className='size-4' strokeWidth={2} />
          </button>
        ) : null}

        <DownloadImageButton
          src={activeVersion?.imageUrl ?? null}
          filename={`${product.name}-${activeVersion?.label ?? ''}`}
        />
      </div>

      {multiple ? (
        <div className='absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 justify-between sm:inset-x-6 lg:inset-x-8'>
          <button
            type='button'
            onClick={() => emblaApi?.scrollPrev()}
            disabled={activeIndex === 0}
            aria-label={t('previous')}
            className={cn(arrowClass, glassClass)}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className='size-4' strokeWidth={2} />
          </button>

          <button
            type='button'
            onClick={() => emblaApi?.scrollNext()}
            disabled={activeIndex === versions.length - 1}
            aria-label={t('next')}
            className={cn(arrowClass, glassClass)}
          >
            <HugeiconsIcon icon={ArrowRight02Icon} className='size-4' strokeWidth={2} />
          </button>
        </div>
      ) : null}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={Math.max(lightboxIndex, 0)}
        slides={slides}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: slides.length <= 1 }}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
        on={{
          view: ({ index }) => {
            const version = zoomable[index]
            if (version && version.id !== activeId) onSelect(version)
          }
        }}
      />
    </>
  )
}
