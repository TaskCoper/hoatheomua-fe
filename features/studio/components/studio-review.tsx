'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import StudioSummaryChoices, {
  toStudioSummaryOptions,
  toStudioSummaryProducts,
  toStudioSummaryTrims
} from '@/features/studio/components/studio-summary-choices'
import {
  formatStudioPrice,
  formatStudioQuantity,
  studioSummaryAmountClass,
  studioSummaryLabelClass,
  studioSummaryRuleClass
} from '@/features/studio/studio-data'
import type { StudioBouquet, StudioScene } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { Add01Icon, MinusSignIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'
const panelClass = 'rounded-3xl bg-secondary/20 p-5 sm:p-6'
const headingClass = 'font-title text-base leading-snug font-bold text-pretty text-primary sm:text-lg'
const quantityButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary/60 text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

interface StudioReviewProps {
  mockup?: StudioScene
  bouquet: StudioBouquet
  designName: string
  onIncreaseIngredient: (id: string) => void
  onDecreaseIngredient: (id: string) => void
}

export default function StudioReview({
  mockup,
  bouquet,
  designName,
  onIncreaseIngredient,
  onDecreaseIngredient
}: StudioReviewProps) {
  const t = useTranslations('studio')
  const tCompose = useTranslations('studio.compose')

  return (
    <article className='animate-in fade-in slide-in-from-right-2 duration-300'>
      <header className='mt-7'>
        <p className='text-xs font-medium text-muted-foreground'>{t('review.creationName')}</p>
        <h2 className='text-pretty font-title text-5xl font-bold leading-tight text-primary'>“{designName}”</h2>
        <p className='text-xs text-muted-foreground'>{t('review.body')}</p>
      </header>

      <section className='mt-14'>
        <StudioStepHeading
          title={t('review.flowersTitle')}
          description={t('review.flowersNote', { count: bouquet.ingredients.length, name: designName })}
        />

        <div className='mt-8 flex flex-col gap-8'>
          {bouquet.ingredients.map(({ ingredient, quantity, extraQuantity }, index) => {
            const name = ingredient.name
            const extraNote =
              ingredient.extraPriceAmount === null
                ? extraQuantity > 0
                  ? tCompose('quantity.addedPlain', { count: extraQuantity })
                  : null
                : extraQuantity > 0
                  ? tCompose('quantity.added', {
                      count: extraQuantity,
                      price: formatStudioPrice(extraQuantity * ingredient.extraPriceAmount)
                    })
                  : tCompose('quantity.extraPrice', {
                      price: formatStudioPrice(ingredient.step * ingredient.extraPriceAmount)
                    })

            return (
              <article
                key={ingredient.id}
                className='grid grid-cols-[3.5rem_1fr] gap-3 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-4'
              >
                <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                  <StudioImage
                    src={ingredient.imageUrl}
                    alt=''
                    fill
                    sizes='(min-width: 640px) 4rem, 3.5rem'
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className='object-cover'
                    pendingIconClassName='size-6'
                  />
                </div>

                <div className='flex min-w-0 items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <h3 className={headingClass}>{name}</h3>
                    {extraNote ? <p className={detailValueClass}>{extraNote}</p> : null}
                  </div>

                  <div className='flex shrink-0 items-center gap-2.5'>
                    <button
                      type='button'
                      onClick={() => onDecreaseIngredient(ingredient.id)}
                      disabled={extraQuantity <= 0}
                      aria-label={tCompose('quantity.decrease', { name })}
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
                      aria-label={tCompose('quantity.increase', { name })}
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

        <div className={cn('mt-8', panelClass)}>
          <p className={studioSummaryLabelClass}>{tCompose('summary.label')}</p>
          <p className='text-xs leading-relaxed text-muted-foreground'>{tCompose('summary.note')}</p>

          <StudioSummaryChoices
            className='mt-5'
            choices={[
              { label: t('review.yourFlowers'), items: toStudioSummaryProducts(bouquet.products) },
              { label: tCompose('style.label'), items: toStudioSummaryOptions(bouquet.style) },
              { label: tCompose('ribbon.label'), items: toStudioSummaryTrims(bouquet.ribbon) },
              { label: tCompose('wrap.label'), items: toStudioSummaryTrims(bouquet.wrap) }
            ]}
          />

          <div className={cn(studioSummaryRuleClass, 'flex items-end justify-between gap-4')}>
            <p className={studioSummaryLabelClass}>{tCompose('summary.total')}</p>
            <p className={studioSummaryAmountClass}>{formatStudioPrice(bouquet.totalAmount)}</p>
          </div>
        </div>
      </section>

      {mockup ? (
        <section className='mt-14'>
          <StudioStepHeading title={t('review.sceneTitle')} description={t('review.sceneNote')} />

          <figure className='mt-6'>
            <div className='relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary/40 ring-1 ring-foreground/5 sm:aspect-[4/3]'>
              <StudioImage
                src={mockup.imageUrl}
                alt={mockup.name}
                fill
                sizes='(min-width: 1024px) 42vw, 100vw'
                className='object-cover'
              />
            </div>
            <figcaption className='mt-4'>
              <p className={microLabelClass}>{t('scene.selectedScene')}</p>
              <h3 className={headingClass}>{mockup.name}</h3>
            </figcaption>
          </figure>
        </section>
      ) : null}

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('review.finalNote')}
      </p>
    </article>
  )
}
