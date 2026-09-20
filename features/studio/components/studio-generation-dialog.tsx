'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetGeneratedFlowers } from '@/features/studio/hooks/use-get-generated-flowers'
import { formatStudioQuantity } from '@/features/studio/studio-data'
import { toStudioSessionVersions } from '@/features/studio/studio-mappers'
import type { StudioGenerationSession } from '@/features/studio/types'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

interface StudioGenerationDialogProps {
  session: StudioGenerationSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StudioGenerationDialog({ session, open, onOpenChange }: StudioGenerationDialogProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const sessionId = session?.sessionId
  const { sessions, isGettingGeneratedFlowers, isGeneratedFlowersError } = useGetGeneratedFlowers({ sessionId })

  const detail = useMemo(
    () => sessions.find((item) => item.sessionId === sessionId) ?? sessions[0],
    [sessions, sessionId]
  )
  const versions = useMemo(() => toStudioSessionVersions(detail?.flowers), [detail])

  const [selected, setSelected] = useState<{ sessionId: string; versionId: string } | null>(null)
  const selectedId = selected && selected.sessionId === sessionId ? selected.versionId : ''

  const active = versions.find((item) => item.id === selectedId) ?? versions[versions.length - 1]
  const activeIndex = Math.max(
    versions.findIndex((item) => item.id === active?.id),
    0
  )

  const [lightboxOpen, setLightboxOpen] = useState(false)

  const slides = useMemo(
    () =>
      versions.flatMap((version) =>
        version.imageUrl
          ? [
              {
                id: version.id,
                src: version.imageUrl,
                alt: t('studio.generations.detail.versionLabel', { index: version.label }),
                width: 1600,
                height: 2000
              }
            ]
          : []
      ),
    [versions, t]
  )
  const lightboxIndex = Math.max(
    slides.findIndex((slide) => slide.id === active?.id),
    0
  )

  const closeDialog = (next: boolean) => {
    // The lightbox lives in its own portal, so it would outlive a dialog closed underneath it.
    if (!next) setLightboxOpen(false)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        className='min-w-[95%] md:min-w-3xl gap-4 rounded-3xl'
        position='top-center'
        onInteractOutside={(event) => {
          if (lightboxOpen) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (lightboxOpen) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className='pr-10 text-pretty font-title text-lg font-bold leading-tight text-primary'>
            {session?.name || t('studio.generations.detail.untitled')}
          </DialogTitle>
          <DialogDescription>
            {[
              session?.mockupName,
              session ? t('studio.generations.versions', { count: session.versionCount }) : null,
              session?.createdAt ? formatDate(session.createdAt, 'dateMedium') : null
            ]
              .filter(Boolean)
              .join(' · ')}
          </DialogDescription>
        </DialogHeader>

        {isGettingGeneratedFlowers ? (
          <DetailLoading />
        ) : isGeneratedFlowersError ? (
          <DetailNote>{t('studio.generations.detail.error')}</DetailNote>
        ) : !active ? (
          <DetailNote>{t('studio.generations.detail.empty')}</DetailNote>
        ) : (
          <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
            <div className='relative'>
              {active.imageUrl ? (
                <button
                  type='button'
                  onClick={() => setLightboxOpen(true)}
                  aria-label={t('studio.generations.detail.openLightbox')}
                  className='block w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                >
                  <PreviewImage
                    src={active.imageUrl}
                    alt={t('studio.generations.detail.versionAlt', {
                      index: active.label,
                      name: session?.name ?? ''
                    })}
                    sizes='(min-width: 640px) 45vw, 90vw'
                    className='aspect-4/5 w-full rounded-2xl transition-transform duration-300 hover:scale-105'
                  />
                </button>
              ) : (
                <PreviewImage
                  src={null}
                  alt={t('studio.generations.detail.versionAlt', {
                    index: active.label,
                    name: session?.name ?? ''
                  })}
                  sizes='(min-width: 640px) 45vw, 90vw'
                  className='aspect-4/5 w-full rounded-2xl'
                />
              )}

              {versions.length > 1 ? (
                <span className='absolute right-2.5 top-2.5 rounded-full bg-white/75 px-2 py-1 text-[0.625rem] font-semibold text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md tabular-nums'>
                  {t('studio.generations.detail.counter', { index: activeIndex + 1, total: versions.length })}
                </span>
              ) : null}
            </div>

            <div className='flex min-w-0 flex-col gap-3'>
              {versions.length > 1 ? (
                <ul className='-mx-1 flex gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                  {versions.map((version) => (
                    <li key={version.id} className='flex-none'>
                      <button
                        type='button'
                        onClick={() => setSelected({ sessionId: sessionId ?? '', versionId: version.id })}
                        aria-current={version.id === active.id}
                        aria-label={t('studio.generations.detail.versionLabel', { index: version.label })}
                        className={cn(
                          'cursor-pointer block overflow-hidden rounded-xl ring-1 transition-[box-shadow,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                          version.id === active.id
                            ? 'opacity-100 ring-2 ring-primary'
                            : 'opacity-70 ring-foreground/10 hover:opacity-100'
                        )}
                      >
                        <PreviewImage
                          src={version.imageUrl}
                          alt=''
                          sizes='4rem'
                          className='aspect-square size-14 rounded-xl'
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <dl className='grid gap-2 divide-y divide-secondary/40 text-xs'>
                <DetailRow label={t('studio.generations.detail.scene')} value={active.mockupName} />
                <DetailRow label={t('studio.generations.detail.style')} value={active.style?.name} />
                <DetailRow label={t('studio.generations.detail.ribbon')} value={active.ribbon?.name} />
                <DetailRow label={t('studio.generations.detail.wrap')} value={active.wrap?.name} />
                <DetailRow
                  label={t('studio.generations.detail.createdAt')}
                  value={active.createdAt ? formatDate(active.createdAt, 'dateMedium') : undefined}
                />
              </dl>

              {active.materials.length ? (
                <div className='grid gap-1.5'>
                  <p className='text-xs font-semibold text-primary'>{t('studio.generations.detail.flowers')}</p>
                  <ul className='flex flex-wrap gap-1.5'>
                    {active.materials.map((material) => (
                      <li
                        key={material.matId}
                        className='rounded-full bg-secondary/50 px-2 py-1 text-[0.6875rem] text-secondary-foreground'
                      >
                        {material.name?.trim() || material.matId} ·{' '}
                        <span className='tabular-nums'>{formatStudioQuantity(material.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          on={{
            view: ({ index }) => {
              const slide = slides[index]
              if (slide) setSelected({ sessionId: sessionId ?? '', versionId: slide.id })
            }
          }}
          slides={slides}
          plugins={[Fullscreen, Thumbnails, Zoom]}
          carousel={{ finite: slides.length <= 1 }}
          thumbnails={{ position: 'bottom', showToggle: true }}
          zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
        />
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null

  return (
    <div className='grid grid-cols-[minmax(0,7rem)_1fr] gap-3 pt-2 first:pt-0'>
      <dt className='font-semibold text-primary'>{label}</dt>
      <dd className='truncate text-muted-foreground'>{value}</dd>
    </div>
  )
}

function DetailNote({ children }: { children: string }) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-2xl bg-secondary/30 px-6 py-10 text-center'>
      <HugeiconsIcon icon={AiMagicIcon} className='size-5 text-primary/50' strokeWidth={1.5} />
      <p className='text-sm text-muted-foreground'>{children}</p>
    </div>
  )
}

function DetailLoading() {
  return (
    <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
      <Skeleton className='aspect-4/5 w-full rounded-2xl' />
      <div className='flex flex-col gap-3'>
        <div className='flex gap-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='size-14 rounded-xl' />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-4 w-full rounded-full' />
        ))}
      </div>
    </div>
  )
}
