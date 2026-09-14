'use client'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { StudioMockup, StudioProduct } from '@/features/studio/types'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioSceneDialogProps {
  mockup: StudioMockup
  product: StudioProduct
  designName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StudioSceneDialog({ mockup, product, designName, open, onOpenChange }: StudioSceneDialogProps) {
  const t = useTranslations('studio.sceneDialog')
  const tStep = useTranslations('studio.scene')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        position='top-center'
        className='grid w-[calc(100%-1.5rem)] max-w-7xl gap-0 rounded-3xl bg-background p-0 sm:max-w-420 lg:grid-cols-[minmax(0,1.5fr)_minmax(23rem,0.8fr)] lg:overflow-hidden'
      >
        <div className='relative m-3 min-h-[55dvh] overflow-hidden rounded-2xl bg-secondary/40 sm:m-4 lg:min-h-[min(48rem,calc(100dvh-5rem))]'>
          <Image
            src={mockup.imageUrl}
            alt={t('fullSceneAlt', { name: mockup.name })}
            fill
            priority
            sizes='(min-width: 1024px) 62vw, 100vw'
            className='object-cover'
          />
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/5 to-transparent'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-4 rounded-2xl border border-white/30 sm:inset-6'
          />

          <div className='absolute left-5 top-5 z-10 sm:left-8 sm:top-8'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
              <HugeiconsIcon icon={SparklesIcon} className='size-3' />
              {t('mockupPreview')}
            </span>
          </div>

          {mockup.imageUrl !== product.imageUrl ? (
            <div className='absolute inset-x-[12%] bottom-[14%] top-[16%] drop-shadow-[0_1.5rem_2.5rem_rgb(28_43_43/35%)]'>
              <Image src={product.imageUrl} alt='' fill sizes='38rem' className='object-contain' />
            </div>
          ) : null}

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
        </div>

        <div className='flex flex-col gap-6 px-4 pb-6 pt-2 sm:px-6 lg:min-h-[min(48rem,calc(100dvh-5rem))] lg:overflow-y-auto lg:py-6 lg:pl-2 lg:pr-6'>
          <div className='pr-12'>
            <DialogTitle className='mt-3 text-pretty font-title text-2xl font-bold leading-tight text-primary'>
              {mockup.name}
            </DialogTitle>
            <DialogDescription className='mt-1 text-xs leading-relaxed text-muted-foreground'>
              {mockup.description}
            </DialogDescription>
          </div>

          <section className='rounded-3xl bg-card/40 p-6'>
            <dl className='flex flex-col divide-y divide-border'>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{tStep('sceneBrief')}</dt>
                <dd className={detailValueClass}>{mockup.description}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{tStep('sceneStoryLabel')}</dt>
                <dd className={detailValueClass}>{mockup.story}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{tStep('sceneMoodLabel')}</dt>
                <dd className='flex flex-wrap gap-2'>
                  {mockup.moods.map((mood) => (
                    <Badge key={mood} variant='secondary'>
                      {mood}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className='font-title text-lg font-bold text-primary'>{t('otherArrangements')}</h3>
            <p className='text-xs text-muted-foreground'>{tStep('floristStudies')}</p>

            <div className='mt-5 flex flex-col gap-6'>
              {mockup.examples.map((example) => (
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

          <p className='mt-auto flex items-start gap-2 text-xs leading-relaxed text-muted-foreground'>
            <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
            {tStep('sceneNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
