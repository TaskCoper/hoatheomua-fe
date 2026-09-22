'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioOptionsFooter from '@/features/studio/components/studio-options-footer'
import StudioOptionSkeletons from '@/features/studio/components/studio-skeletons'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { formatStudioPrice, formatStudioQuantity } from '@/features/studio/studio-data'
import type { StudioBouquet, StudioOption, StudioTrim, StudioVariant } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { Add01Icon, MinusSignIcon, Search01Icon, SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Lightbox, { type Slide } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

const quantityButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const tileClass = (selected: boolean) =>
  cn(
    'group relative isolate block cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    selected
      ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
      : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
  )

const trimCardClass = () =>
  cn(
    'group flex cursor-pointer flex-col gap-2 rounded-2xl p-2 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  )

const trimSwatchClass = (selected: boolean) =>
  cn(
    'relative block aspect-square w-full overflow-hidden rounded-xl bg-secondary/50 outline-2 outline-offset-2 transition-[box-shadow,outline-color] duration-300',
    selected
      ? 'shadow-[0_0.8rem_2rem_rgb(81_108_108/18%)] outline-primary'
      : 'shadow-[0_0.4rem_1rem_rgb(81_108_108/8%)] outline-transparent group-hover:outline-primary/30'
  )

interface StudioComposeStepProps {
  bouquet: StudioBouquet
  variantOptions: StudioVariant[]
  selectedVariantId: string
  styleOptions: StudioOption[]
  ribbonOptions: StudioTrim[]
  wrapOptions: StudioTrim[]
  isGettingStyleOptions: boolean
  isGettingRibbonOptions: boolean
  isGettingWrapOptions: boolean
  isGettingMoreStyleOptions: boolean
  isGettingMoreRibbonOptions: boolean
  isGettingMoreWrapOptions: boolean
  hasMoreStyleOptions: boolean
  hasMoreRibbonOptions: boolean
  hasMoreWrapOptions: boolean
  onLoadMoreStyleOptions: () => void
  onLoadMoreRibbonOptions: () => void
  onLoadMoreWrapOptions: () => void
  onIncreaseIngredient: (id: string) => void
  onDecreaseIngredient: (id: string) => void
  onSelectVariant: (id: string) => void
  onSelectStyle: (id: string) => void
  onSelectRibbon: (id: string) => void
  onSelectWrap: (id: string) => void
}

export default function StudioComposeStep({
  bouquet,
  variantOptions,
  selectedVariantId,
  styleOptions,
  ribbonOptions,
  wrapOptions,
  isGettingStyleOptions,
  isGettingRibbonOptions,
  isGettingWrapOptions,
  isGettingMoreStyleOptions,
  isGettingMoreRibbonOptions,
  isGettingMoreWrapOptions,
  hasMoreStyleOptions,
  hasMoreRibbonOptions,
  hasMoreWrapOptions,
  onLoadMoreStyleOptions,
  onLoadMoreRibbonOptions,
  onLoadMoreWrapOptions,
  onIncreaseIngredient,
  onDecreaseIngredient,
  onSelectVariant,
  onSelectStyle,
  onSelectRibbon,
  onSelectWrap
}: StudioComposeStepProps) {
  const t = useTranslations('studio.compose')

  const [zoomed, setZoomed] = useState<{ slides: Slide[]; index: number } | null>(null)

  const openZoom = (options: StudioTrim[], selectedId: string | undefined) => {
    const shown = options.flatMap((option) => (option.imageUrl ? [{ ...option, imageUrl: option.imageUrl }] : []))
    if (shown.length === 0) return

    setZoomed({
      slides: shown.map<Slide>((option) => ({
        src: option.imageUrl,
        alt: option.name,
        title: option.name,
        description: option.priceAmount
          ? [option.description, formatStudioPrice(option.priceAmount)].filter(Boolean).join(' · ')
          : (option.description ?? undefined)
      })),
      index: Math.max(
        shown.findIndex((option) => option.id === selectedId),
        0
      )
    })
  }

  const trimSection = (
    className: string,
    label: string,
    note: string,
    options: StudioTrim[],
    selectedId: string | undefined,
    loading: boolean,
    loadingMore: boolean,
    hasMore: boolean,
    onSelect: (id: string) => void,
    onLoadMore: () => void
  ) => (
    <section className={className}>
      <StudioStepHeading
        title={label}
        description={note}
        actions={
          options.some((option) => option.imageUrl) ? (
            <button
              type='button'
              onClick={() => openZoom(options, selectedId)}
              aria-label={t('zoom.open', { label })}
              className='inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className='size-3.5' />
              {t('zoom.cta')}
            </button>
          ) : null
        }
      />

      <div role='radiogroup' aria-label={label} className='mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3'>
        {loading ? <StudioOptionSkeletons count={5} className='aspect-square w-full rounded-xl' /> : null}

        {options.map((option, index) => {
          const isSelected = option.id === selectedId

          return (
            <button
              key={option.id}
              type='button'
              role='radio'
              aria-checked={isSelected}
              title={option.name}
              onClick={() => onSelect(option.id)}
              className={trimCardClass()}
            >
              <span className={trimSwatchClass(isSelected)}>
                <StudioImage
                  src={option.imageUrl}
                  alt=''
                  fill
                  sizes='(min-width: 640px) 12vw, 28vw'
                  loading={index < 5 ? 'eager' : 'lazy'}
                  className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]'
                  pendingIconClassName='size-5'
                />

                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white text-primary shadow-[0_0.2rem_0.6rem_rgb(81_108_108/25%)] transition-[opacity,transform] duration-200',
                    isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                  )}
                >
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-3' />
                </span>
              </span>

              <span className='block min-w-0 px-0.5 pb-0.5'>
                <span
                  className={cn(
                    'block truncate text-xs font-semibold leading-snug transition-colors',
                    isSelected ? 'text-primary' : 'text-foreground/75'
                  )}
                >
                  {option.name}
                </span>

                {option.priceAmount ? (
                  <span className='mt-0.5 block text-[0.6875rem] leading-snug text-muted-foreground'>
                    {formatStudioPrice(option.priceAmount)}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      <div className='mt-4 flex justify-center'>
        <StudioOptionsFooter
          count={options.length}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
        />
      </div>
    </section>
  )

  const hasIngredients = bouquet.ingredients.length > 0
  const hasVariants = variantOptions.length > 0

  return (
    <div>
      {hasVariants ? (
        <section className='mt-7'>
          <StudioStepHeading title={t('variant.label')} description={t('variant.note')} />

          <div role='radiogroup' aria-label={t('variant.label')} className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {variantOptions.map((variant, index) => {
              const selected = variant.id === selectedVariantId

              return (
                <button
                  key={variant.id}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  onClick={() => onSelectVariant(variant.id)}
                  className={cn(tileClass(selected), 'aspect-[4/5] w-full')}
                >
                  <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                    <StudioImage
                      src={variant.imageUrl}
                      alt=''
                      fill
                      sizes='(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw'
                      loading={index < 3 ? 'eager' : 'lazy'}
                      className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]'
                    />
                    <span
                      aria-hidden='true'
                      className='absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent'
                    />
                  </span>

                  <span className='relative z-10 flex h-full min-w-0 flex-col justify-end p-3 text-white'>
                    <span className='mb-auto flex justify-end'>
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full border transition-colors',
                          selected
                            ? 'border-white bg-white text-primary'
                            : 'border-white/50 bg-black/10 text-transparent backdrop-blur-sm'
                        )}
                      >
                        <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                      </span>
                    </span>

                    <span className='line-clamp-2 block text-pretty font-title text-sm font-bold leading-tight text-white'>
                      {variant.name}
                    </span>
                    {variant.priceAmount === null ? null : (
                      <span className='mt-0.5 block text-[0.6875rem] font-semibold leading-snug text-white/80'>
                        {formatStudioPrice(variant.priceAmount)}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className={hasVariants ? 'mt-14' : 'mt-7'}>
        <StudioStepHeading
          title={t('bouquet.label')}
          description={hasIngredients ? t('bouquet.note') : t('bouquet.emptyNote')}
        />

        <div className='mt-8 flex flex-col gap-8'>
          {bouquet.ingredients.map(({ ingredient, quantity, extraQuantity }, index) => {
            const name = ingredient.name
            const extraNote =
              ingredient.extraPriceAmount === null
                ? extraQuantity > 0
                  ? t('quantity.addedPlain', { count: extraQuantity })
                  : null
                : extraQuantity > 0
                  ? t('quantity.added', {
                      count: extraQuantity,
                      price: formatStudioPrice(extraQuantity * ingredient.extraPriceAmount)
                    })
                  : // One press adds a step, not a single unit, so the price quotes the step.
                    t('quantity.extraPrice', {
                      price: formatStudioPrice(ingredient.step * ingredient.extraPriceAmount)
                    })

            return (
              <article key={ingredient.id} className='grid gap-4 sm:grid-cols-[minmax(0,4rem)_1fr]'>
                <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                  <StudioImage
                    src={ingredient.imageUrl}
                    alt=''
                    fill
                    sizes='(min-width: 640px) 4rem, 100vw'
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className='object-cover'
                    pendingIconClassName='size-6'
                  />
                </div>

                <div className='flex min-w-0 items-center justify-between gap-4'>
                  <div className='min-w-0'>
                    <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{name}</h3>
                    {extraNote ? <p className='text-xs leading-relaxed text-muted-foreground'>{extraNote}</p> : null}
                  </div>

                  <div className='flex shrink-0 items-center gap-2.5'>
                    <button
                      type='button'
                      onClick={() => onDecreaseIngredient(ingredient.id)}
                      disabled={extraQuantity <= 0}
                      aria-label={t('quantity.decrease', { name })}
                      className={cn(quantityButtonClass, 'disabled:cursor-not-allowed disabled:opacity-40')}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} className='size-3.5' />
                    </button>
                    <span className='font-title text-lg font-bold leading-none tabular-nums text-primary'>
                      {formatStudioQuantity(quantity)}
                    </span>
                    <button
                      type='button'
                      onClick={() => onIncreaseIngredient(ingredient.id)}
                      aria-label={t('quantity.increase', { name })}
                      className={quantityButtonClass}
                    >
                      <HugeiconsIcon icon={Add01Icon} className='size-3.5' />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading title={t('style.label')} description={t('style.note')} />

        <div role='radiogroup' aria-label={t('style.label')} className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {isGettingStyleOptions ? (
            <StudioOptionSkeletons count={4} className='aspect-[3/4] w-full rounded-2xl' />
          ) : null}
          {styleOptions.map((style, index) => {
            const selected = style.id === bouquet.style?.id

            return (
              <button
                key={style.id}
                type='button'
                role='radio'
                aria-checked={selected}
                onClick={() => onSelectStyle(style.id)}
                className={cn(tileClass(selected), 'aspect-[3/4] w-full')}
              >
                <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                  <StudioImage
                    src={style.imageUrl}
                    alt=''
                    fill
                    sizes='(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 45vw'
                    loading={index < 2 ? 'eager' : 'lazy'}
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]'
                  />
                  <span
                    aria-hidden='true'
                    className='absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent'
                  />
                </span>

                <span className='relative z-10 flex h-full min-w-0 flex-col justify-end p-3 text-white'>
                  <span className='mb-auto flex justify-end'>
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full border transition-colors',
                        selected
                          ? 'border-white bg-white text-primary'
                          : 'border-white/50 bg-black/10 text-transparent backdrop-blur-sm'
                      )}
                    >
                      <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                    </span>
                  </span>

                  <span className='block text-pretty font-title text-sm font-bold leading-tight text-white'>
                    {style.name}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className='mt-4 flex justify-center'>
          <StudioOptionsFooter
            count={styleOptions.length}
            loading={isGettingStyleOptions}
            loadingMore={isGettingMoreStyleOptions}
            hasMore={hasMoreStyleOptions}
            onLoadMore={onLoadMoreStyleOptions}
          />
        </div>
      </section>

      {trimSection(
        'mt-14',
        t('ribbon.label'),
        t('ribbon.note'),
        ribbonOptions,
        bouquet.ribbon?.id,
        isGettingRibbonOptions,
        isGettingMoreRibbonOptions,
        hasMoreRibbonOptions,
        onSelectRibbon,
        onLoadMoreRibbonOptions
      )}

      {trimSection(
        'mt-4',
        t('wrap.label'),
        t('wrap.note'),
        wrapOptions,
        bouquet.wrap?.id,
        isGettingWrapOptions,
        isGettingMoreWrapOptions,
        hasMoreWrapOptions,
        onSelectWrap,
        onLoadMoreWrapOptions
      )}

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('closingNote')}
      </p>

      <Lightbox
        open={!!zoomed}
        close={() => setZoomed(null)}
        index={zoomed?.index ?? 0}
        slides={zoomed?.slides ?? []}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: (zoomed?.slides.length ?? 0) <= 1 }}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: false }}
      />
    </div>
  )
}
