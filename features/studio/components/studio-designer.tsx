'use client'

import type { ProductDetail } from '@/features/products/types'
import StudioComposeStep from '@/features/studio/components/studio-compose-step'
import StudioDesktopNav from '@/features/studio/components/studio-desktop-nav'
import StudioHeader from '@/features/studio/components/studio-header'
import StudioIngredientsStep from '@/features/studio/components/studio-ingredients-step'
import StudioMobileNav from '@/features/studio/components/studio-mobile-nav'
import StudioMockupGrid from '@/features/studio/components/studio-mockup-grid'
import StudioPreview from '@/features/studio/components/studio-preview'
import StudioResult from '@/features/studio/components/studio-result'
import StudioReview from '@/features/studio/components/studio-review'
import StudioSceneDialog from '@/features/studio/components/studio-scene-dialog'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { useStudioDesigner } from '@/features/studio/hooks/use-studio-designer'
import { studioMockups } from '@/features/studio/studio-data'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function StudioDesigner({ product: detail }: { product: ProductDetail }) {
  const t = useTranslations('studio')
  const [sceneOpen, setSceneOpen] = useState(false)
  const {
    control,
    product,
    step,
    maxStep,
    generationStatus,
    generationStage,
    added,
    versions,
    activeVersionId,
    mockup,
    selectedMockupId,
    productIngredients,
    variantOptions,
    selectedProductId,
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
    loadMoreStyleOptions,
    loadMoreRibbonOptions,
    loadMoreWrapOptions,
    trimmedName,
    nameValid,
    bouquet,
    setStep,
    setAdded,
    goTo,
    goNext,
    goBack,
    markChanged,
    selectMockup,
    selectVariant,
    increaseIngredient,
    decreaseIngredient,
    selectStyle,
    selectRibbon,
    selectWrap,
    selectVersion,
    startGeneration
  } = useStudioDesigner(detail)

  const canContinue = step === 1 ? nameValid : step === 2 ? true : Boolean(selectedMockupId)
  const addToBag = () => setAdded(true)

  const desktopNav = (
    <StudioDesktopNav step={step} status={generationStatus} canContinue={canContinue} onNext={goNext} onBack={goBack} />
  )

  return (
    <form
      onSubmit={startGeneration}
      className='flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground'
    >
      <StudioHeader step={step} maxStep={maxStep} onStep={setStep} />

      <main className='grid flex-1 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(30rem,5fr)_minmax(0,6fr)]'>
        <StudioPreview
          product={product}
          step={step}
          status={generationStatus}
          stage={generationStage}
          mockup={mockup}
          bouquet={bouquet}
          designName={trimmedName}
          versions={versions}
          activeVersionId={activeVersionId}
          added={added}
          onSelectVersion={selectVersion}
          onAddToBag={addToBag}
        />

        <section className='relative bg-background lg:order-1 lg:h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:border-r lg:border-secondary/40'>
          <div className='mx-auto flex min-h-full max-w-4xl flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 xl:px-10'>
            {step === 1 ? (
              <StudioIngredientsStep
                control={control}
                product={product}
                ingredients={productIngredients}
                actions={desktopNav}
                onNameChange={markChanged}
              />
            ) : null}

            {step === 2 ? (
              <div className='animate-in fade-in slide-in-from-right-2 duration-300'>
                <StudioComposeStep
                  bouquet={bouquet}
                  variantOptions={variantOptions}
                  selectedVariantId={selectedProductId}
                  styleOptions={styleOptions}
                  ribbonOptions={ribbonOptions}
                  wrapOptions={wrapOptions}
                  isGettingStyleOptions={isGettingStyleOptions}
                  isGettingRibbonOptions={isGettingRibbonOptions}
                  isGettingWrapOptions={isGettingWrapOptions}
                  isGettingMoreStyleOptions={isGettingMoreStyleOptions}
                  isGettingMoreRibbonOptions={isGettingMoreRibbonOptions}
                  isGettingMoreWrapOptions={isGettingMoreWrapOptions}
                  hasMoreStyleOptions={hasMoreStyleOptions}
                  hasMoreRibbonOptions={hasMoreRibbonOptions}
                  hasMoreWrapOptions={hasMoreWrapOptions}
                  onLoadMoreStyleOptions={() => loadMoreStyleOptions()}
                  onLoadMoreRibbonOptions={() => loadMoreRibbonOptions()}
                  onLoadMoreWrapOptions={() => loadMoreWrapOptions()}
                  actions={desktopNav}
                  onIncreaseIngredient={increaseIngredient}
                  onDecreaseIngredient={decreaseIngredient}
                  onSelectVariant={selectVariant}
                  onSelectStyle={selectStyle}
                  onSelectRibbon={selectRibbon}
                  onSelectWrap={selectWrap}
                />
              </div>
            ) : null}

            {step === 3 ? (
              <div className='animate-in fade-in slide-in-from-right-2 duration-300'>
                <section className='mt-7'>
                  <StudioStepHeading
                    title={t('scene.chooseTitle')}
                    description={t('scene.chooseNote', { count: studioMockups.length })}
                    actions={desktopNav}
                  />

                  <StudioMockupGrid
                    mockups={studioMockups}
                    selectedId={selectedMockupId}
                    onSelect={selectMockup}
                    onExpand={() => setSceneOpen(true)}
                  />
                </section>
              </div>
            ) : null}

            {step === 4 ? (
              <StudioReview
                mockup={mockup}
                bouquet={bouquet}
                designName={trimmedName}
                actions={desktopNav}
                onIncreaseIngredient={increaseIngredient}
                onDecreaseIngredient={decreaseIngredient}
              />
            ) : null}

            {step === 5 ? (
              <StudioResult
                product={product}
                mockup={mockup}
                bouquet={bouquet}
                designName={trimmedName}
                status={generationStatus}
                actions={desktopNav}
                versionLabel={versions.find((item) => item.id === activeVersionId)?.label}
                onCreateAnother={() => goTo(2)}
              />
            ) : null}
          </div>
        </section>
      </main>

      <StudioMobileNav
        step={step}
        status={generationStatus}
        canContinue={canContinue}
        added={added}
        onNext={goNext}
        onBack={goBack}
        onAddToBag={addToBag}
      />

      {mockup ? (
        <StudioSceneDialog
          mockup={mockup}
          product={product}
          designName={trimmedName}
          open={sceneOpen}
          onOpenChange={setSceneOpen}
        />
      ) : null}
    </form>
  )
}
