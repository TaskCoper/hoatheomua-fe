'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import StudioImage from '@/features/studio/components/studio-image'
import { useGetMockupGeneratedFlowers } from '@/features/studio/hooks/use-get-mockup-generated-flowers'
import type { MockupGeneratedFlower, StudioProduct, StudioScene } from '@/features/studio/types'
import { useDateFormat } from '@/lib/date'
import { AiMagicIcon, Search01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioSceneDialogProps {
  mockup: StudioScene
  product: StudioProduct
  designName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StudioSceneDialog({ mockup, product, designName, open, onOpenChange }: StudioSceneDialogProps) {
  const t = useTranslations('studio.sceneDialog')
  const tStep = useTranslations('studio.scene')

  // Story, mood and studies only exist on the seeded scenes - API scenes just carry a name and a brief.
  const moods = mockup.moods ?? []
  const examples = mockup.examples ?? []

  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [isSceneLightboxOpen, setIsSceneLightboxOpen] = useState(false)
  const isLightboxOpen = lightboxIndex >= 0 || isSceneLightboxOpen

  const closeDialog = (next: boolean) => {
    // A lightbox lives in its own portal, so either would outlive a dialog closed underneath it.
    if (!next) {
      setLightboxIndex(-1)
      setIsSceneLightboxOpen(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        position='top-center'
        className='grid w-[calc(100%-1.5rem)] max-w-7xl gap-0 rounded-3xl bg-background p-0 sm:max-w-420 lg:grid-cols-[minmax(0,1.5fr)_minmax(23rem,0.8fr)] lg:overflow-hidden'
        onInteractOutside={(event) => {
          if (isLightboxOpen) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (isLightboxOpen) event.preventDefault()
        }}
      >
        <button
          type='button'
          onClick={() => setIsSceneLightboxOpen(true)}
          disabled={!mockup.imageUrl}
          aria-label={t('openLightbox', { name: mockup.name })}
          className='group relative m-3 min-h-[55dvh] cursor-zoom-in overflow-hidden rounded-2xl bg-secondary/40 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default sm:m-4 lg:min-h-[min(48rem,calc(100dvh-5rem))]'
        >
          <StudioImage
            src={mockup.imageUrl}
            alt={t('fullSceneAlt', { name: mockup.name })}
            fill
            preload
            sizes='(min-width: 1024px) 62vw, 100vw'
            className='object-cover transition-transform duration-700 group-hover:scale-[1.03]'
            pendingLabel={t('mockupPreview')}
            pendingIconClassName='size-12'
          />
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/5 to-transparent'
          />

          {mockup.imageUrl ? (
            <span
              aria-hidden='true'
              className='absolute bottom-5 right-5 z-10 grid size-9 place-items-center rounded-full bg-white/70 text-primary opacity-0 shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:bottom-8 sm:right-8'
            >
              <HugeiconsIcon icon={Search01Icon} className='size-4' strokeWidth={2} />
            </span>
          ) : null}

          <div className='absolute left-5 top-5 z-10 sm:left-8 sm:top-8'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
              <HugeiconsIcon icon={SparklesIcon} className='size-3' />
              {t('mockupPreview')}
            </span>
          </div>

          <div className='absolute inset-x-5 bottom-5 z-10 text-white sm:inset-x-8 sm:bottom-8'>
            <p className='mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-white/75'>
              {tStep('selectedScene')}
            </p>
            <p className='text-pretty font-title text-2xl font-bold leading-tight text-white sm:text-3xl'>
              {designName ? `“${designName}”` : t('newCreation')}
            </p>
            <p className='mt-1.5 text-xs text-white/75'>
              {product.name} · {mockup.name}
            </p>
          </div>
        </button>

        <div className='flex flex-col gap-6 px-4 pb-6 pt-2 sm:px-6 lg:min-h-[min(48rem,calc(100dvh-5rem))] lg:overflow-y-auto lg:py-6 lg:pl-2 lg:pr-6'>
          <div className='pr-12'>
            <DialogTitle className='mt-3 text-pretty font-title text-2xl font-bold leading-tight text-primary'>
              {mockup.name}
            </DialogTitle>
            <DialogDescription className='mt-1 text-xs leading-relaxed text-muted-foreground'>
              {mockup.description}
            </DialogDescription>
          </div>

          {mockup.description || mockup.story || moods.length > 0 ? (
            <section className='rounded-3xl bg-card/40 p-6'>
              <dl className='flex flex-col divide-y divide-border'>
                {mockup.description ? (
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>{tStep('sceneBrief')}</dt>
                    <dd className={detailValueClass}>{mockup.description}</dd>
                  </div>
                ) : null}
                {mockup.story ? (
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>{tStep('sceneStoryLabel')}</dt>
                    <dd className={detailValueClass}>{mockup.story}</dd>
                  </div>
                ) : null}
                {moods.length > 0 ? (
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>{tStep('sceneMoodLabel')}</dt>
                    <dd className='flex flex-wrap gap-2'>
                      {moods.map((mood) => (
                        <Badge key={mood} variant='secondary'>
                          {mood}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {examples.length > 0 ? (
            <section>
              <h3 className='font-title text-lg font-bold text-primary'>{t('otherArrangements')}</h3>
              <p className='text-xs text-muted-foreground'>{tStep('floristStudies')}</p>

              <div className='mt-5 flex flex-col gap-6'>
                {examples.map((example) => (
                  <article
                    key={example.imageUrl}
                    className='grid grid-cols-[3.5rem_1fr] gap-4 sm:grid-cols-[minmax(0,4rem)_1fr]'
                  >
                    <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                      <Image
                        src={example.imageUrl}
                        alt={tStep('exampleByAlt', { title: example.title, creator: example.creator })}
                        fill
                        sizes='4rem'
                        className='object-cover'
                      />
                    </div>

                    <div className='min-w-0'>
                      <p className={microLabelClass}>
                        {tStep('exampleBy', { creator: example.creator })} · {mockup.name}
                      </p>
                      <h4 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>
                        {example.title}
                      </h4>
                      <p className='text-xs leading-relaxed text-muted-foreground'>{mockup.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <MockupGallery
            mockup={mockup}
            enabled={open}
            lightboxIndex={lightboxIndex}
            onLightboxIndexChange={setLightboxIndex}
          />

          <p className='mt-auto flex items-start gap-2 text-xs leading-relaxed text-muted-foreground'>
            <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
            {tStep('sceneNote')}
          </p>
        </div>

        {/* One scene, so no strip to walk along - just the picture, as large as it goes. */}
        <Lightbox
          open={isSceneLightboxOpen}
          close={() => setIsSceneLightboxOpen(false)}
          slides={
            mockup.imageUrl
              ? [
                  {
                    src: mockup.imageUrl,
                    alt: t('fullSceneAlt', { name: mockup.name }),
                    title: mockup.name,
                    description: mockup.description ?? undefined
                  }
                ]
              : []
          }
          plugins={[Captions, Fullscreen, Zoom]}
          carousel={{ finite: true }}
          zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
        />
      </DialogContent>
    </Dialog>
  )
}

function MockupGallery({
  mockup,
  enabled,
  lightboxIndex,
  onLightboxIndexChange
}: {
  mockup: StudioScene
  enabled: boolean
  lightboxIndex: number
  onLightboxIndexChange: (index: number) => void
}) {
  const tGallery = useTranslations('studio.sceneDialog.gallery')
  const { formatDate } = useDateFormat()

  const {
    flowers,
    totalCount,
    isGettingMockupFlowers,
    isMockupFlowersError,
    isGettingMoreMockupFlowers,
    hasMoreMockupFlowers,
    loadMoreMockupFlowers
  } = useGetMockupGeneratedFlowers({ mockupId: mockup.id, enabled })

  const slides = useMemo(
    () =>
      flowers.map((flower) => ({
        src: flower.imageUrl,
        alt: flower.name?.trim() || tGallery('untitled'),
        title: flower.name?.trim() || tGallery('untitled'),
        description: flower.createdAt ? formatDate(flower.createdAt, 'dateMedium') : undefined
      })),
    [flowers, formatDate, tGallery]
  )

  // Nothing to show and nothing to wait for: the section stays out of the way entirely.
  if (!isGettingMockupFlowers && !isMockupFlowersError && flowers.length === 0) return null

  return (
    <section>
      <h3 className='flex items-center gap-2 font-title text-lg font-bold text-primary'>
        <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className='size-4 shrink-0' />
        {tGallery('title')}
      </h3>
      <p className='text-xs text-muted-foreground'>
        {isGettingMockupFlowers ? tGallery('loading') : tGallery('count', { count: totalCount })}
      </p>

      {isMockupFlowersError ? (
        <p className='mt-4 rounded-2xl bg-secondary/30 px-4 py-6 text-center text-xs text-muted-foreground'>
          {tGallery('error')}
        </p>
      ) : (
        <>
          <ul className='mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4'>
            {isGettingMockupFlowers
              ? Array.from({ length: 8 }).map((_, index) => (
                  <li key={index}>
                    <Skeleton className='aspect-square w-full rounded-2xl' />
                  </li>
                ))
              : flowers.map((flower, index) => (
                  <li key={flower.id}>
                    <GalleryTile flower={flower} sceneName={mockup.name} onOpen={() => onLightboxIndexChange(index)} />
                  </li>
                ))}

            {isGettingMoreMockupFlowers
              ? Array.from({ length: 4 }).map((_, index) => (
                  <li key={`more-${index}`}>
                    <Skeleton className='aspect-square w-full rounded-2xl' />
                  </li>
                ))
              : null}
          </ul>

          {hasMoreMockupFlowers && !isGettingMoreMockupFlowers ? (
            <div className='mt-3 flex justify-center'>
              <Button type='button' variant='outline' size='sm' onClick={() => loadMoreMockupFlowers()}>
                {tGallery('loadMore')}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => onLightboxIndexChange(-1)}
        index={Math.max(lightboxIndex, 0)}
        slides={slides}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: slides.length <= 1 }}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
      />
    </section>
  )
}

function GalleryTile({
  flower,
  sceneName,
  onOpen
}: {
  flower: MockupGeneratedFlower
  sceneName: string
  onOpen: () => void
}) {
  const tGallery = useTranslations('studio.sceneDialog.gallery')
  const name = flower.name?.trim() || tGallery('untitled')

  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={tGallery('openLightbox', { name })}
      className='group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-foreground/5 transition-shadow duration-300 hover:shadow-[0_0.8rem_2rem_rgb(81_108_108/18%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
    >
      <StudioImage
        src={flower.imageUrl}
        alt={tGallery('imageAlt', { name, scene: sceneName })}
        fill
        sizes='(min-width: 1024px) 8rem, 30vw'
        loading='lazy'
        className='object-cover transition-transform duration-500 group-hover:scale-105'
        pendingIconClassName='size-5'
      />

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'
      />
      <span className='pointer-events-none absolute inset-x-1.5 bottom-1.5 truncate text-[0.625rem] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
        {name}
      </span>
    </button>
  )
}
