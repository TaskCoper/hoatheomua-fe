'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioMockupGrid from '@/features/studio/components/studio-mockup-grid'
import StudioOptionsFooter from '@/features/studio/components/studio-options-footer'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { formatStudioIngredientCounts, STUDIO_SESSION_STYLE_STEP } from '@/features/studio/studio-data'
import type { StudioBouquet, StudioOption, StudioProduct, StudioScene, StudioStep } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { SquareLock01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioRegeneratePanelProps {
  step: StudioStep
  product: StudioProduct
  bouquet: StudioBouquet
  designName: string
  styleOptions: StudioOption[]
  sceneOptions: StudioScene[]
  selectedStyleId: string
  selectedSceneId: string
  isGettingStyleOptions: boolean
  isGettingSceneOptions: boolean
  isGettingMoreStyleOptions: boolean
  isGettingMoreSceneOptions: boolean
  hasMoreStyleOptions: boolean
  hasMoreSceneOptions: boolean
  isRegenerating: boolean
  actions?: ReactNode
  onLoadMoreStyleOptions: () => void
  onLoadMoreSceneOptions: () => void
  onSelectStyle: (id: string) => void
  onSelectScene: (id: string) => void
  onExpandScene: () => void
}

/**
 * The two steps a regenerate reopens. Everything else the session was built from rides along
 * as a locked summary, so it is plain what this request can and cannot change.
 */
export default function StudioRegeneratePanel({
  step,
  product,
  bouquet,
  designName,
  styleOptions,
  sceneOptions,
  selectedStyleId,
  selectedSceneId,
  isGettingStyleOptions,
  isGettingSceneOptions,
  isGettingMoreStyleOptions,
  isGettingMoreSceneOptions,
  hasMoreStyleOptions,
  hasMoreSceneOptions,
  isRegenerating,
  actions,
  onLoadMoreStyleOptions,
  onLoadMoreSceneOptions,
  onSelectStyle,
  onSelectScene,
  onExpandScene
}: StudioRegeneratePanelProps) {
  const t = useTranslations('studio.regenerate')
  const tCompose = useTranslations('studio.compose')
  const tScene = useTranslations('studio.scene')
  const tReview = useTranslations('studio.review')

  const lockedRows = [
    { label: tReview('creationName'), value: designName },
    { label: tCompose('bouquet.label'), value: product.name },
    {
      label: tCompose('quantity.label'),
      value: bouquet.ingredients.length > 0 ? formatStudioIngredientCounts(bouquet.ingredients) : null
    },
    { label: tCompose('ribbon.label'), value: bouquet.ribbon?.name },
    { label: tCompose('wrap.label'), value: bouquet.wrap?.name }
  ].filter((row) => Boolean(row.value))

  return (
    <fieldset disabled={isRegenerating} className='contents'>
      {step === STUDIO_SESSION_STYLE_STEP ? (
        <section className='mt-7 animate-in fade-in slide-in-from-right-2 duration-300'>
          <StudioStepHeading title={t('title')} description={t('note')} actions={actions} />

          <div
            role='radiogroup'
            aria-label={tCompose('style.label')}
            className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4'
          >
            {styleOptions.map((style, index) => {
              const selected = style.id === selectedStyleId

              return (
                <button
                  key={style.id}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  onClick={() => onSelectStyle(style.id)}
                  className={cn(
                    'group relative isolate block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none',
                    selected
                      ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
                      : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
                  )}
                >
                  <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                    <StudioImage
                      src={style.imageUrl}
                      alt=''
                      fill
                      sizes='(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 45vw'
                      loading={index < 4 ? 'eager' : 'lazy'}
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
      ) : (
        <div className='animate-in fade-in slide-in-from-right-2 duration-300'>
          <section className='mt-7'>
            <StudioStepHeading
              title={tScene('chooseTitle')}
              description={tScene('chooseNote', { count: sceneOptions.length })}
              actions={actions}
            />

            <StudioMockupGrid
              mockups={sceneOptions}
              selectedId={selectedSceneId}
              onSelect={onSelectScene}
              onExpand={onExpandScene}
            />

            <div className='mt-4 flex justify-center'>
              <StudioOptionsFooter
                count={sceneOptions.length}
                loading={isGettingSceneOptions}
                loadingMore={isGettingMoreSceneOptions}
                hasMore={hasMoreSceneOptions}
                onLoadMore={onLoadMoreSceneOptions}
              />
            </div>
          </section>

          <section className='mt-14'>
            <StudioStepHeading title={t('lockedTitle')} description={t('lockedNote')} />

            <div aria-disabled='true' className='mt-6 rounded-3xl bg-card/40 p-6 opacity-70'>
              <dl className='flex flex-col divide-y divide-border'>
                {lockedRows.map((row) => (
                  <div key={row.label} className={detailRowClass}>
                    <dt className={cn(detailTermClass, 'flex items-center gap-1.5')}>
                      <HugeiconsIcon icon={SquareLock01Icon} className='size-3.5 shrink-0 text-muted-foreground' />
                      {row.label}
                    </dt>
                    <dd className={detailValueClass}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      )}
    </fieldset>
  )
}
