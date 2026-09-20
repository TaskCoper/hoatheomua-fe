'use client'

import { Badge } from '@/components/ui/badge'
import StudioImage from '@/features/studio/components/studio-image'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { formatStudioIngredientCounts, formatStudioPrice, formatStudioQuantity } from '@/features/studio/studio-data'
import type {
  StudioBouquet,
  StudioGenerationStatus,
  StudioProduct,
  StudioScene,
  StudioVersion
} from '@/features/studio/types'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { ArrowRight02Icon, SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioResultProps {
  product: StudioProduct
  mockup?: StudioScene
  bouquet: StudioBouquet
  designName: string
  status: StudioGenerationStatus
  actions?: ReactNode
  version?: StudioVersion
  createAnotherTitle?: string
  createAnotherNote?: string
  onCreateAnother: () => void
}

export default function StudioResult({
  product,
  mockup,
  bouquet,
  designName,
  status,
  actions,
  version,
  createAnotherTitle,
  createAnotherNote,
  onCreateAnother
}: StudioResultProps) {
  const t = useTranslations('studio')
  const tScene = useTranslations('studio.scene')
  const tCompose = useTranslations('studio.compose')
  const { formatDateTime } = useDateFormat()
  const complete = status === 'complete'

  const style = version?.style ?? bouquet.style
  const ribbon = version?.ribbon ?? bouquet.ribbon
  const wrap = version?.wrap ?? bouquet.wrap

  const flowers = version?.materials.length
    ? version.materials.map((material) => ({
        id: material.matId,
        name: material.name,
        quantity: material.quantity,
        isCore: material.isCore,
        imageUrl: bouquet.ingredients.find((item) => item.ingredient.id === material.matId)?.ingredient.imageUrl ?? null
      }))
    : bouquet.ingredients.map(({ ingredient, quantity }) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity,
        isCore: false,
        imageUrl: ingredient.imageUrl
      }))

  return (
    <article className='animate-in fade-in slide-in-from-right-2 duration-500'>
      <header className='mt-7'>
        <p className={cn(microLabelClass, 'text-xs')}>
          {t('result.eyebrow')}
          {version ? ` · ${t('versions.short', { index: version.label })}` : ''}
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
            {bouquet.ingredients.length > 0 ? (
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{tCompose('quantity.label')}</dt>
                <dd className={detailValueClass}>{formatStudioIngredientCounts(bouquet.ingredients)}</dd>
              </div>
            ) : null}
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('style.label')}</dt>
              <dd className={detailValueClass}>{style?.name}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('ribbon.label')}</dt>
              <dd className={detailValueClass}>{ribbon?.name}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('wrap.label')}</dt>
              <dd className={detailValueClass}>{wrap?.name}</dd>
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

            {version?.createdAt ? (
              <div className={detailRowClass}>
                <dt className={detailTermClass}>{t('result.createdAt')}</dt>
                <dd className={detailValueClass}>{formatDateTime(version.createdAt, 'dateTimeMedium')}</dd>
              </div>
            ) : null}

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
                {createAnotherTitle ?? t('result.generateAnother')}
              </span>
              <span className='block text-xs leading-relaxed text-muted-foreground'>
                {createAnotherNote ?? t('result.generateAnotherNote')}
              </span>
            </span>

            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className='size-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1'
            />
          </button>
        ) : null}
      </section>

      {flowers.length > 0 ? (
        <section className='mt-14'>
          <StudioStepHeading
            title={t('review.flowersTitle')}
            description={t('review.flowersNote', { count: flowers.length, name: product.name })}
          />

          <div className='mt-6 flex flex-col gap-8'>
            {flowers.map((flower) => (
              <article key={flower.id} className='grid gap-4 sm:grid-cols-[minmax(0,4rem)_1fr]'>
                <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                  <StudioImage
                    src={flower.imageUrl}
                    alt={flower.name}
                    fill
                    sizes='(min-width: 1024px) 11rem, (min-width: 640px) 30vw, 100vw'
                    loading='lazy'
                    className='object-cover'
                    pendingIconClassName='size-6'
                  />
                </div>

                <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5'>
                  <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{flower.name}</h3>
                  {flower.isCore ? <Badge variant='secondary'>{t('result.core')}</Badge> : null}
                  <span className='ml-auto shrink-0 text-xs tabular-nums text-muted-foreground'>
                    ×{formatStudioQuantity(flower.quantity)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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
