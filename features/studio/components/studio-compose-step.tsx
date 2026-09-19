'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import {
  formatStudioIngredientCounts,
  formatStudioPrice,
  studioRibbons,
  studioStyles,
  studioWraps
} from '@/features/studio/studio-data'
import type { StudioBouquet, StudioSwatch } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { Add01Icon, MinusSignIcon, SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailTermClass = 'text-sm font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
// Every block on this step sits in the same shell so the four sections read as one stack.
const panelClass = 'mt-4 rounded-3xl bg-card/40 p-5 sm:p-6'
const quantityButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

// Shared with the mockup grid so a selected tile reads the same wherever it appears.
const tileClass = (selected: boolean) =>
  cn(
    'group relative isolate block cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    selected
      ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
      : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
  )

interface StudioComposeStepProps {
  /** `bouquet.products[0]` is always the design the user arrived with. */
  bouquet: StudioBouquet
  actions?: ReactNode
  onIncreaseIngredient: (id: string) => void
  onDecreaseIngredient: (id: string) => void
  onSelectStyle: (id: string) => void
  onSelectRibbon: (id: string) => void
  onSelectWrap: (id: string) => void
}

export default function StudioComposeStep({
  bouquet,
  actions,
  onIncreaseIngredient,
  onDecreaseIngredient,
  onSelectStyle,
  onSelectRibbon,
  onSelectWrap
}: StudioComposeStepProps) {
  const t = useTranslations('studio.compose')
  const tStyles = useTranslations('studio.styles')
  const tRibbons = useTranslations('studio.ribbons')
  const tWraps = useTranslations('studio.wraps')

  const swatchRow = (
    label: string,
    swatches: StudioSwatch[],
    selectedId: string | undefined,
    nameOf: (id: string) => string,
    onSelect: (id: string) => void
  ) => (
    <div className={cn(detailRowClass, 'items-center py-5')}>
      <div className='min-w-0'>
        <p className={detailTermClass}>{label}</p>
        <p className={cn(microLabelClass, 'truncate')}>{selectedId ? nameOf(selectedId) : null}</p>
      </div>

      <div role='radiogroup' aria-label={label} className='flex flex-wrap gap-4'>
        {swatches.map((swatch) => {
          const selected = swatch.id === selectedId
          const name = nameOf(swatch.id)

          return (
            <button
              key={swatch.id}
              type='button'
              role='radio'
              aria-checked={selected}
              aria-label={name}
              title={name}
              onClick={() => onSelect(swatch.id)}
              style={{ backgroundColor: swatch.color }}
              className={cn(
                'flex size-10 cursor-pointer items-center justify-center rounded-full outline-2 outline-offset-2 ring-1 ring-inset ring-foreground/10 transition-[outline-color] duration-200',
                selected ? 'outline-primary' : 'outline-transparent hover:outline-primary/35',
                'focus-visible:outline-primary'
              )}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={3}
                className={cn(
                  'size-4 text-white drop-shadow-[0_0.0625rem_0.125rem_rgb(0_0_0/45%)] transition-opacity duration-200',
                  selected ? 'opacity-100' : 'opacity-0'
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )

  const hasIngredients = bouquet.ingredients.length > 0

  return (
    <div>
      {/* Nothing to count when the catalogue lists no materials - the step then
          starts straight at the shape and the finishing colours. */}
      <section className='mt-7'>
        <StudioStepHeading
          title={t('bouquet.label')}
          description={hasIngredients ? t('bouquet.note') : t('bouquet.emptyNote')}
          actions={actions}
        />

        <div className='mt-8 flex flex-col gap-8'>
          {bouquet.ingredients.map(({ ingredient, extraQuantity }, index) => {
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
                  : t('quantity.extraPrice', { price: formatStudioPrice(ingredient.extraPriceAmount) })

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

                <div className='flex min-w-0 items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{name}</h3>
                    {extraNote ? <p className='text-xs leading-relaxed text-muted-foreground'>{extraNote}</p> : null}
                  </div>

                  {/* Extra stems can be taken back out, but the design's own base stems stay. */}
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
                    {/* The design's own stem count is not published, so the
                        counter reads as what is being added to it. */}
                    <span className='font-title text-lg font-bold leading-none tabular-nums text-primary'>
                      +{extraQuantity}
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
          {studioStyles.map((style, index) => {
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
                  <Image
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
                    {tStyles(`${style.id}.name`)}
                  </span>
                  <span className='mt-0.5 line-clamp-2 block text-[0.6875rem] leading-snug text-white/75'>
                    {tStyles(`${style.id}.description`)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading title={t('finishing.label')} description={t('finishing.note')} />

        <div className={cn(panelClass, 'flex flex-col')}>
          {swatchRow(t('ribbon.label'), studioRibbons, bouquet.ribbon?.id, (id) => tRibbons(id), onSelectRibbon)}
          {swatchRow(t('wrap.label'), studioWraps, bouquet.wrap?.id, (id) => tWraps(id), onSelectWrap)}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading title={t('summary.label')} description={t('summary.note')} />

        <div className={panelClass}>
          <dl className='flex flex-col divide-y divide-border'>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('bouquet.label')}</dt>
              <dd className={detailValueClass}>{bouquet.products.map((item) => item.name).join(' + ')}</dd>
            </div>
            {hasIngredients ? (
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{t('quantity.label')}</dt>
                <dd className={detailValueClass}>{formatStudioIngredientCounts(bouquet.ingredients)}</dd>
              </div>
            ) : null}
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('style.label')}</dt>
              <dd className={detailValueClass}>{bouquet.style ? tStyles(`${bouquet.style.id}.name`) : null}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('finishing.label')}</dt>
              <dd className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', detailValueClass)}>
                {[bouquet.ribbon, bouquet.wrap].map((swatch, index) =>
                  swatch ? (
                    <span key={swatch.id} className='flex items-center gap-1.5'>
                      <span
                        aria-hidden='true'
                        style={{ backgroundColor: swatch.color }}
                        className='size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10'
                      />
                      {index === 0 ? tRibbons(swatch.id) : tWraps(swatch.id)}
                    </span>
                  ) : null
                )}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('summary.total')}</dt>
              <dd className='font-title text-lg font-bold leading-none text-primary'>
                {formatStudioPrice(bouquet.totalAmount)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('closingNote')}
      </p>
    </div>
  )
}
