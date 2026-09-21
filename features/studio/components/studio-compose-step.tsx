'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioOptionsFooter from '@/features/studio/components/studio-options-footer'
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

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailTermClass = 'text-sm font-semibold text-primary'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const panelClass = 'mt-4 rounded-3xl bg-card/40 p-5 sm:p-6'
const quantityButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const tileClass = (selected: boolean) =>
  cn(
    'group relative isolate block cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    selected
      ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
      : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
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

  const swatchRow = (
    label: string,
    options: StudioTrim[],
    selectedId: string | undefined,
    loading: boolean,
    loadingMore: boolean,
    hasMore: boolean,
    onSelect: (id: string) => void,
    onLoadMore: () => void
  ) => {
    const selected = options.find((option) => option.id === selectedId)

    return (
      <div className={cn(detailRowClass, 'items-center py-5')}>
        <div className='min-w-0'>
          <p className={detailTermClass}>{label}</p>
          {/* Both trims are part of the bouquet, so what they add is priced in, not a surcharge. */}
          <p className={cn(microLabelClass, 'truncate')}>
            {selected?.priceAmount ? `${selected.name} · ${formatStudioPrice(selected.priceAmount)}` : selected?.name}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-4'>
          <div role='radiogroup' aria-label={label} className='flex flex-wrap items-center gap-4'>
            {options.map((option) => {
              const isSelected = option.id === selectedId

              return (
                <button
                  key={option.id}
                  type='button'
                  role='radio'
                  aria-checked={isSelected}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'relative isolate size-10 cursor-pointer overflow-hidden rounded-full bg-secondary/40 outline-2 outline-offset-2 ring-1 ring-inset ring-foreground/10 transition-[outline-color] duration-200',
                    isSelected ? 'outline-primary' : 'outline-transparent hover:outline-primary/35',
                    'focus-visible:outline-primary'
                  )}
                >
                  <StudioImage
                    src={option.imageUrl}
                    alt=''
                    fill
                    sizes='2.5rem'
                    loading='lazy'
                    className='object-cover'
                    pendingIconClassName='size-4'
                  />
                  <span
                    aria-hidden='true'
                    className={cn(
                      'absolute inset-0 flex items-center justify-center bg-primary/45 text-white transition-opacity duration-200',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={3} className='size-4' />
                  </span>
                </button>
              )
            })}
          </div>

          {options.some((option) => option.imageUrl) ? (
            <button
              type='button'
              onClick={() => openZoom(options, selectedId)}
              aria-label={t('zoom.open', { label })}
              className='inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5 text-[0.6875rem] font-semibold text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className='size-3.5' />
              {t('zoom.cta')}
            </button>
          ) : null}

          <StudioOptionsFooter
            count={options.length}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
          />
        </div>
      </div>
    )
  }

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

      <section className='mt-14'>
        <StudioStepHeading title={t('finishing.label')} description={t('finishing.note')} />

        <div className={cn(panelClass, 'flex flex-col')}>
          {swatchRow(
            t('ribbon.label'),
            ribbonOptions,
            bouquet.ribbon?.id,
            isGettingRibbonOptions,
            isGettingMoreRibbonOptions,
            hasMoreRibbonOptions,
            onSelectRibbon,
            onLoadMoreRibbonOptions
          )}
          {swatchRow(
            t('wrap.label'),
            wrapOptions,
            bouquet.wrap?.id,
            isGettingWrapOptions,
            isGettingMoreWrapOptions,
            hasMoreWrapOptions,
            onSelectWrap,
            onLoadMoreWrapOptions
          )}
        </div>
      </section>

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('closingNote')}
      </p>

      {/* Looking only - the choice is made on the swatches, never in here. */}
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
