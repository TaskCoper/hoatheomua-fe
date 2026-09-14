'use client'

import StudioProductDialog from '@/features/studio/components/studio-product-dialog'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import {
  formatStudioPrice,
  studioCompanionProducts,
  studioRibbons,
  studioSizes,
  studioStyles,
  studioWraps
} from '@/features/studio/studio-data'
import type { StudioBouquet, StudioSwatch } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import {
  Add01Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Exchange01Icon,
  SparklesIcon,
  Tick02Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'

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
  companionProductIds: string[]
  slotCount: number
  actions?: ReactNode
  onSelectSize: (id: string) => void
  onSelectStyle: (id: string) => void
  onSelectRibbon: (id: string) => void
  onSelectWrap: (id: string) => void
  onSetCompanion: (slot: number, id: string) => void
  onRemoveCompanion: (slot: number) => void
}

export default function StudioComposeStep({
  bouquet,
  companionProductIds,
  slotCount,
  actions,
  onSelectSize,
  onSelectStyle,
  onSelectRibbon,
  onSelectWrap,
  onSetCompanion,
  onRemoveCompanion
}: StudioComposeStepProps) {
  const t = useTranslations('studio.compose')
  const tSizes = useTranslations('studio.sizes')
  const tStyles = useTranslations('studio.styles')
  const tRibbons = useTranslations('studio.ribbons')
  const tWraps = useTranslations('studio.wraps')

  // `null` keeps the dialog closed; a number is the 1-based companion slot being filled.
  const [openSlot, setOpenSlot] = useState<number | null>(null)

  const swatchRow = (
    label: string,
    swatches: StudioSwatch[],
    selectedId: string | undefined,
    nameOf: (id: string) => string,
    onSelect: (id: string) => void
  ) => (
    <div>
      <p className={detailTermClass}>{label}</p>

      <div role='radiogroup' aria-label={label} className='mt-3 flex flex-wrap gap-3'>
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
              onClick={() => onSelect(swatch.id)}
              className='group flex cursor-pointer flex-col items-center gap-1.5 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none'
            >
              <span
                style={{ backgroundColor: swatch.color }}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full ring-1 ring-inset ring-foreground/10 transition-[box-shadow] duration-300',
                  selected
                    ? 'shadow-[0_0_0_0.125rem_var(--color-background),0_0_0_0.25rem_var(--color-primary)]'
                    : 'group-hover:shadow-[0_0_0_0.125rem_var(--color-background),0_0_0_0.25rem_rgb(81_108_108/30%)]',
                  'group-focus-visible:shadow-[0_0_0_0.125rem_var(--color-background),0_0_0_0.25rem_var(--color-primary)]'
                )}
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={3}
                  className={cn('size-4 text-white drop-shadow-sm', selected ? 'opacity-100' : 'opacity-0')}
                />
              </span>
              <span
                className={cn(
                  'w-18 text-center text-[0.625rem] font-medium leading-tight',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div>
      <section className='mt-7'>
        <StudioStepHeading title={t('size.label')} description={t('size.note')} actions={actions} />

        <div role='radiogroup' aria-label={t('size.label')} className='mt-6 grid gap-3 sm:grid-cols-3'>
          {studioSizes.map((size) => {
            const selected = size.id === bouquet.size?.id

            return (
              <button
                key={size.id}
                type='button'
                role='radio'
                aria-checked={selected}
                onClick={() => onSelectSize(size.id)}
                className={cn(tileClass(selected), 'flex items-center gap-4 bg-card/40 p-4')}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full font-title text-lg font-bold transition-colors',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-secondary-foreground'
                  )}
                >
                  {size.label}
                </span>

                <span className='min-w-0'>
                  <span className={cn(microLabelClass, 'block')}>
                    {t('size.flowerCount', { count: size.flowerCount })}
                  </span>
                  <span className='block truncate font-title text-lg font-bold leading-snug text-primary'>
                    {tSizes(`${size.id}.name`)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading
          title={t('bouquet.label')}
          description={t('bouquet.note', { count: slotCount, filled: bouquet.products.length })}
        />

        <div className='mt-6 flex flex-col gap-8'>
          {Array.from({ length: slotCount }, (_, index) => {
            const slotProduct = bouquet.products[index]
            const base = index === 0

            if (slotProduct)
              return (
                <article
                  key={`slot-${index}`}
                  className='grid gap-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,4rem)_1fr]'
                >
                  <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                    <Image
                      src={slotProduct.imageUrl}
                      alt=''
                      fill
                      sizes='(min-width: 640px) 4rem, 100vw'
                      className={cn(slotProduct.imageFit === 'cover' ? 'object-cover' : 'object-contain p-1.5')}
                    />
                  </div>

                  <div className='flex min-w-0 items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <p className={microLabelClass}>
                        {base ? t('bouquet.slotBase') : t('bouquet.slotIndex', { slot: index + 1 })} ·{' '}
                        {formatStudioPrice(slotProduct.priceAmount)}
                      </p>
                      <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>
                        {slotProduct.name}
                      </h3>
                      <p className='text-xs leading-relaxed text-muted-foreground'>{slotProduct.note}</p>
                    </div>

                    {base ? null : (
                      <div className='flex shrink-0 items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => setOpenSlot(index)}
                          aria-label={t('bouquet.change', { name: slotProduct.name })}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        >
                          <HugeiconsIcon icon={Exchange01Icon} className='size-3.5' />
                        </button>
                        <button
                          type='button'
                          onClick={() => onRemoveCompanion(index)}
                          aria-label={t('bouquet.remove', { name: slotProduct.name })}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className='size-3.5' />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )

            return (
              <button
                key={`slot-${index}`}
                type='button'
                onClick={() => setOpenSlot(index)}
                className='group flex w-full cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-primary/30 bg-secondary/25 p-5 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/40 hover:shadow-[0_1rem_2.5rem_rgb(81_108_108/14%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              >
                <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-90'>
                  <HugeiconsIcon icon={Add01Icon} className='size-5' />
                </span>

                <span className='min-w-0 flex-1'>
                  <span className={cn(microLabelClass, 'block')}>{t('bouquet.slotIndex', { slot: index + 1 })}</span>
                  <span className='block text-pretty font-title text-lg font-bold leading-snug text-primary'>
                    {t('bouquet.add')}
                  </span>
                  <span className='block text-xs leading-relaxed text-muted-foreground'>{t('bouquet.addNote')}</span>
                </span>

                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className='size-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1'
                />
              </button>
            )
          })}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading title={t('style.label')} description={t('style.note')} />

        <div role='radiogroup' aria-label={t('style.label')} className='mt-6 grid gap-3 sm:grid-cols-2'>
          {studioStyles.map((style, index) => {
            const selected = style.id === bouquet.style?.id

            return (
              <button
                key={style.id}
                type='button'
                role='radio'
                aria-checked={selected}
                onClick={() => onSelectStyle(style.id)}
                className={cn(tileClass(selected), 'aspect-[4/5] w-full')}
              >
                <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                  <Image
                    src={style.imageUrl}
                    alt=''
                    fill
                    sizes='(min-width: 1024px) 23vw, 48vw'
                    loading={index < 2 ? 'eager' : 'lazy'}
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]'
                  />
                  <span
                    aria-hidden='true'
                    className='absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent'
                  />
                </span>

                <span className='relative z-10 flex h-full min-w-0 flex-col justify-end p-3.5 text-white sm:p-4'>
                  <span className='mb-auto flex justify-end'>
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full border transition-colors',
                        selected
                          ? 'border-white bg-white text-primary'
                          : 'border-white/50 bg-black/10 text-transparent backdrop-blur-sm'
                      )}
                    >
                      <HugeiconsIcon icon={Tick02Icon} className='size-3.5' strokeWidth={2.5} />
                    </span>
                  </span>

                  <span className='block text-pretty font-title text-base font-bold leading-tight text-white'>
                    {tStyles(`${style.id}.name`)}
                  </span>
                  <span className='mt-1 line-clamp-2 block text-xs leading-relaxed text-white/75'>
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

        <div className='mt-6 flex flex-col gap-8 rounded-3xl bg-card/40 p-6'>
          {swatchRow(t('ribbon.label'), studioRibbons, bouquet.ribbon?.id, (id) => tRibbons(id), onSelectRibbon)}
          {swatchRow(t('wrap.label'), studioWraps, bouquet.wrap?.id, (id) => tWraps(id), onSelectWrap)}
        </div>
      </section>

      <section className='mt-14'>
        <StudioStepHeading title={t('summary.label')} description={t('summary.note')} />

        <div className='mt-6 rounded-3xl bg-card/40 p-6'>
          <dl className='flex flex-col divide-y divide-border'>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('bouquet.label')}</dt>
              <dd className={detailValueClass}>{bouquet.products.map((item) => item.name).join(' + ')}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('size.label')}</dt>
              <dd className={detailValueClass}>{bouquet.size ? tSizes(`${bouquet.size.id}.name`) : null}</dd>
            </div>
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

      <StudioProductDialog
        products={studioCompanionProducts}
        takenIds={companionProductIds}
        selectedId={openSlot === null ? undefined : companionProductIds[openSlot - 1]}
        slot={(openSlot ?? 0) + 1}
        open={openSlot !== null}
        onOpenChange={(next) => setOpenSlot(next ? openSlot : null)}
        onSelect={(id) => {
          if (openSlot !== null) onSetCompanion(openSlot, id)
        }}
      />
    </div>
  )
}
