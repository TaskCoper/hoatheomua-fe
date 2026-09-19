'use client'

import { Button } from '@/components/ui/button'
import StudioGenerationOverlay from '@/features/studio/components/studio-generation-overlay'
import StudioImage from '@/features/studio/components/studio-image'
import StudioResultCarousel from '@/features/studio/components/studio-result-carousel'
import { formatStudioPrice, roundStudioQuantity, STUDIO_LAST_STEP } from '@/features/studio/studio-data'
import type {
  StudioBouquet,
  StudioGenerationStatus,
  StudioMockup,
  StudioProduct,
  StudioStep,
  StudioVersion
} from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface StudioPreviewProps {
  product: StudioProduct
  step: StudioStep
  status: StudioGenerationStatus
  stage: number
  mockup?: StudioMockup
  bouquet: StudioBouquet
  designName: string
  versions: StudioVersion[]
  activeVersionId: string
  added: boolean
  onSelectVersion: (version: StudioVersion) => void
  onAddToBag: () => void
}

export default function StudioPreview({
  product,
  step,
  status,
  stage,
  mockup,
  bouquet,
  designName,
  versions,
  activeVersionId,
  added,
  onSelectVersion,
  onAddToBag
}: StudioPreviewProps) {
  const t = useTranslations('studio')
  const tNav = useTranslations('studio.nav')

  const showVersions = step === STUDIO_LAST_STEP && status !== 'generating' && versions.length > 0
  const extraStems = roundStudioQuantity(bouquet.ingredients.reduce((total, item) => total + item.extraQuantity, 0))
  const complete = step === STUDIO_LAST_STEP && status === 'complete'

  const hero = (() => {
    if (step <= 2)
      return {
        src: product.imageUrl,
        alt: product.name,
        object: product.imageFit === 'cover' ? 'object-cover' : 'object-contain p-8 sm:p-14'
      }
    if (mockup)
      return {
        src: mockup.imageUrl,
        alt: t('preview.mockupSceneAlt', { product: product.name, mockup: mockup.name }),
        object: 'object-cover'
      }
    return { src: '/images/about/studio-flatlay.png', alt: t('preview.workTableAlt'), object: 'object-cover' }
  })()

  const overlayProduct = !showVersions && step > 1 && mockup && mockup.imageUrl !== product.imageUrl

  const stageLabel =
    step === 1
      ? t('preview.stage.ingredients')
      : step === 2
        ? t('preview.stage.compose')
        : step === 3
          ? t('preview.stage.mockup')
          : step === 4
            ? t('preview.stage.review')
            : status === 'complete'
              ? t('preview.stage.resultReady')
              : t('preview.stage.resultPending')

  return (
    <section
      aria-label={t('preview.ariaLabel')}
      className='relative min-h-[21rem] overflow-hidden bg-secondary/40 sm:min-h-[30rem] lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)]'
    >
      {showVersions ? (
        <StudioResultCarousel
          versions={versions}
          activeId={activeVersionId}
          product={product}
          onSelect={onSelectVersion}
        />
      ) : (
        <StudioImage
          key={`${hero.src}-${step}`}
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes='(min-width: 1024px) 60vw, 100vw'
          className={cn('animate-in fade-in zoom-in-[0.98] duration-700', hero.object, step > 1 && 'brightness-[0.88]')}
          pendingLabel={t('imagePending')}
          pendingIconClassName='size-12'
        />
      )}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/5 to-transparent'
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-4 rounded-2xl border border-white/30 sm:inset-7 lg:inset-8'
      />

      <div className='absolute left-5 top-5 z-10 sm:left-8 sm:top-8 lg:left-10 lg:top-10'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
          <HugeiconsIcon icon={SparklesIcon} className='size-3' />
          {complete ? t('preview.createdForYou') : t('preview.liveLabel')}
        </span>
      </div>

      {overlayProduct && product.imageUrl ? (
        <div className='absolute inset-0 flex items-center justify-center px-8 pb-14 pt-8'>
          <div className='relative h-full w-full max-w-[28rem] drop-shadow-[0_1.5rem_2.5rem_rgb(28_43_43/30%)]'>
            <Image
              src={product.imageUrl}
              alt=''
              fill
              sizes='28rem'
              className={cn('object-contain', product.imageFit === 'cover' && 'rounded-3xl object-cover opacity-95')}
            />
          </div>
        </div>
      ) : null}

      {status === 'generating' ? <StudioGenerationOverlay name={designName} stage={stage} /> : null}

      <div className='absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 text-white sm:p-8 lg:p-10'>
        <div>
          <p className='mb-2 text-xs font-semibold text-white/75'>{stageLabel}</p>
          <p className='text-pretty font-title text-2xl font-bold leading-tight text-white sm:text-3xl'>
            {step === 1 ? product.name : designName ? `“${designName}”` : product.name}
          </p>
          {step > 1 ? (
            <p className='mt-1.5 text-xs text-white/75'>
              {[
                bouquet.products.map((item) => item.name).join(' + '),
                extraStems > 0 ? t('compose.quantity.extra', { count: extraStems }) : null,
                bouquet.style?.name,
                [bouquet.ribbon?.name, bouquet.wrap?.name].filter(Boolean).join(' · ') || null,
                mockup?.name
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>

        {complete ? (
          <div className='flex flex-col items-end gap-3'>
            <div className='text-right'>
              <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-white/75'>
                {t('result.price')}
              </p>
              <p className='font-title text-2xl font-bold leading-tight text-white'>
                {formatStudioPrice(bouquet.totalAmount)}
              </p>
            </div>

            <div className='hidden flex-wrap items-center justify-end gap-2 lg:flex'>
              <Button type='button' size='lg' onClick={onAddToBag} className='bg-white text-primary hover:bg-white/90'>
                {added ? (
                  <>
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                    {tNav('addedToBag')}
                  </>
                ) : (
                  tNav('addToBag')
                )}
              </Button>
              <Button
                type='button'
                size='lg'
                variant='outline'
                className='border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white'
              >
                {tNav('buyNow')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
