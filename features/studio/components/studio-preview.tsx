'use client'

import { Button } from '@/components/ui/button'
import StudioGenerationOverlay from '@/features/studio/components/studio-generation-overlay'
import StudioImage from '@/features/studio/components/studio-image'
import StudioResultCarousel from '@/features/studio/components/studio-result-carousel'
import { formatStudioPrice, STUDIO_LAST_STEP } from '@/features/studio/studio-data'
import type {
  StudioBouquet,
  StudioGenerationStatus,
  StudioProduct,
  StudioScene,
  StudioStep,
  StudioVersion
} from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface StudioPreviewProps {
  product: StudioProduct
  step: StudioStep
  status: StudioGenerationStatus
  stage: number
  mockup?: StudioScene
  bouquet: StudioBouquet
  designName: string
  versions: StudioVersion[]
  activeVersionId: string
  added: boolean
  isAddToBagDisabled?: boolean
  isBuyNowDisabled?: boolean
  productOverlay?: boolean
  onSelectVersion: (version: StudioVersion) => void
  onAddToBag: () => void
  onBuyNow: () => void
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
  isAddToBagDisabled = false,
  isBuyNowDisabled = false,
  productOverlay = true,
  onSelectVersion,
  onAddToBag,
  onBuyNow
}: StudioPreviewProps) {
  const t = useTranslations('studio')
  const tNav = useTranslations('studio.nav')

  const showVersions = step === STUDIO_LAST_STEP && status !== 'generating' && versions.length > 0
  const complete = step === STUDIO_LAST_STEP && status === 'complete'

  const hero = (() => {
    if (step <= 4)
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

  const overlayProduct = productOverlay && !showVersions && step > 4 && mockup && mockup.imageUrl !== product.imageUrl

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

      <div className='absolute inset-x-0 bottom-0 z-10 bg-primary/55 text-white backdrop-blur-md'>
        <div className='flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5 lg:px-10'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-white/75'>{stageLabel}</p>
            <p className='truncate text-pretty font-title text-lg font-bold leading-tight text-white sm:text-xl'>
              {step === 1 ? product.name : designName ? `“${designName}”` : product.name}
            </p>
          </div>

          {step > 1 ? (
            <div className='shrink-0 text-right'>
              <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-white/75'>
                {t('result.price')}
              </p>
              <p className='font-title text-xl font-bold leading-tight text-white sm:text-2xl'>
                {formatStudioPrice(bouquet.totalAmount)}
              </p>
            </div>
          ) : null}
        </div>

        {complete ? (
          <div className='hidden flex-wrap items-center justify-end gap-2 border-t border-white/15 px-5 py-3 sm:px-8 lg:flex lg:px-10'>
            <Button
              type='button'
              size='lg'
              onClick={onAddToBag}
              disabled={isAddToBagDisabled}
              className='bg-white text-primary hover:bg-white/90'
            >
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
              onClick={onBuyNow}
              disabled={isBuyNowDisabled}
              className='border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white'
            >
              {tNav('buyNow')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
