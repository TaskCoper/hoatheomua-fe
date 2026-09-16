'use client'

import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { formatStudioIngredientCounts, formatStudioPrice } from '@/features/studio/studio-data'
import type { StudioBouquet, StudioGenerationStatus, StudioMockup, StudioProduct } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { ArrowRight02Icon, SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioResultProps {
  product: StudioProduct
  mockup?: StudioMockup
  bouquet: StudioBouquet
  designName: string
  status: StudioGenerationStatus
  actions?: ReactNode
  versionLabel?: number
  onCreateAnother: () => void
}

export default function StudioResult({
  product,
  mockup,
  bouquet,
  designName,
  status,
  actions,
  versionLabel,
  onCreateAnother
}: StudioResultProps) {
  const t = useTranslations('studio')
  const tScene = useTranslations('studio.scene')
  const tCompose = useTranslations('studio.compose')
  const tIngredients = useTranslations('studio.ingredients')
  const complete = status === 'complete'

  return (
    <article className='animate-in fade-in slide-in-from-right-2 duration-500'>
      <header className='mt-7'>
        <p className={cn(microLabelClass, 'text-xs')}>
          {t('result.eyebrow')}
          {versionLabel ? ` · ${t('versions.short', { index: versionLabel })}` : ''}
        </p>
        <h1 className='text-pretty font-title text-5xl font-bold leading-tight text-primary'>“{designName}”</h1>
        <p className='text-xs text-muted-foreground'>
          {product.name} · {mockup?.name}
        </p>
      </header>

      <section className='mt-14'>
        <StudioStepHeading
          title={complete ? t('result.readyTitle') : t('result.pendingTitle')}
          description={complete ? t('result.readyBody') : t('result.pendingBody', { mockup: mockup?.name ?? '' })}
          actions={actions}
        />

        <div className='mt-6 rounded-3xl bg-card/40 p-6'>
          <dl className='flex flex-col divide-y divide-border'>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('result.flowers')}</dt>
              <dd className={detailValueClass}>{bouquet.products.map((item) => item.name).join(' + ')}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('quantity.label')}</dt>
              <dd className={detailValueClass}>
                {formatStudioIngredientCounts(bouquet.ingredients, (id) => tIngredients(`${id}.name`))}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('style.label')}</dt>
              <dd className={detailValueClass}>{bouquet.style ? t(`styles.${bouquet.style.id}.name`) : null}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('ribbon.label')}</dt>
              <dd className={cn('flex items-center gap-2', detailValueClass)}>
                {bouquet.ribbon ? (
                  <>
                    <span
                      aria-hidden='true'
                      style={{ backgroundColor: bouquet.ribbon.color }}
                      className='size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10'
                    />
                    {t(`ribbons.${bouquet.ribbon.id}`)}
                  </>
                ) : null}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('wrap.label')}</dt>
              <dd className={cn('flex items-center gap-2', detailValueClass)}>
                {bouquet.wrap ? (
                  <>
                    <span
                      aria-hidden='true'
                      style={{ backgroundColor: bouquet.wrap.color }}
                      className='size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10'
                    />
                    {t(`wraps.${bouquet.wrap.id}`)}
                  </>
                ) : null}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('result.mockup')}</dt>
              <dd className={detailValueClass}>{mockup?.name}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('result.status')}</dt>
              <dd className={cn('flex items-center gap-1.5', detailValueClass)}>
                {complete ? (
                  <>
                    <HugeiconsIcon icon={Tick02Icon} className='size-3.5 shrink-0 text-primary' strokeWidth={2.5} />
                    {t('result.ready')}
                  </>
                ) : (
                  t('preview.stage.resultPending')
                )}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{t('result.price')}</dt>
              <dd className='font-title text-lg font-bold leading-none text-primary'>
                {formatStudioPrice(bouquet.totalAmount)}
              </dd>
            </div>
          </dl>
        </div>

        {complete ? (
          <button
            type='button'
            onClick={onCreateAnother}
            className='group mt-4 flex w-full cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-primary/30 bg-secondary/25 p-5 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/40 hover:shadow-[0_1rem_2.5rem_rgb(81_108_108/14%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          >
            <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-12'>
              <HugeiconsIcon icon={SparklesIcon} className='size-5' />
            </span>

            <span className='min-w-0 flex-1'>
              <span className='block text-pretty font-title text-lg font-bold leading-snug text-primary'>
                {t('result.generateAnother')}
              </span>
              <span className='block text-xs leading-relaxed text-muted-foreground'>
                {t('result.generateAnotherNote')}
              </span>
            </span>

            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className='size-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1'
            />
          </button>
        ) : null}
      </section>

      <section className='mt-14'>
        <StudioStepHeading
          title={t('review.flowersTitle')}
          description={t('review.flowersNote', { count: bouquet.ingredients.length, name: product.name })}
        />

        <div className='mt-6 flex flex-col gap-8'>
          {bouquet.ingredients.map(({ ingredient, quantity }) => (
            <article key={ingredient.id} className='grid gap-4 sm:grid-cols-[minmax(0,4rem)_1fr]'>
              <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                <Image
                  src={ingredient.imageUrl}
                  alt={tIngredients(`${ingredient.id}.name`)}
                  fill
                  sizes='(min-width: 1024px) 11rem, (min-width: 640px) 30vw, 100vw'
                  loading='lazy'
                  className='object-cover'
                />
              </div>

              <div className='min-w-0'>
                <p className={microLabelClass}>
                  {tIngredients(`${ingredient.id}.amount`, { count: quantity })} ·{' '}
                  {tIngredients(`${ingredient.id}.color`)}
                </p>
                <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>
                  {tIngredients(`${ingredient.id}.name`)}
                </h3>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {tIngredients(`${ingredient.id}.meaning`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {mockup ? (
        <section className='mt-14'>
          <StudioStepHeading title={t('review.sceneTitle')} description={t('review.sceneNote')} />

          <figure className='mt-6'>
            <div className='relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary/40 ring-1 ring-foreground/5 sm:aspect-[4/3]'>
              <Image
                src={mockup.imageUrl}
                alt={mockup.name}
                fill
                sizes='(min-width: 1024px) 42vw, 100vw'
                className='object-cover'
              />
            </div>
            <figcaption className='mt-4'>
              <p className={microLabelClass}>{tScene('selectedScene')}</p>
              <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{mockup.name}</h3>
            </figcaption>
          </figure>
        </section>
      ) : null}

      <p className='mt-14 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {complete ? t('step1.detailsNote') : t('result.pendingNote')}
      </p>
    </article>
  )
}
