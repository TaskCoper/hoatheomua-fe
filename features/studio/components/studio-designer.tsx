'use client'

import type { ProductFamily } from '@/features/products/types'
import StudioComposeStep from '@/features/studio/components/studio-compose-step'
import StudioDesktopNav from '@/features/studio/components/studio-desktop-nav'
import StudioHeader from '@/features/studio/components/studio-header'
import StudioIngredientsStep from '@/features/studio/components/studio-ingredients-step'
import StudioMobileNav from '@/features/studio/components/studio-mobile-nav'
import StudioMockupGrid from '@/features/studio/components/studio-mockup-grid'
import StudioOptionsFooter from '@/features/studio/components/studio-options-footer'
import StudioPreview from '@/features/studio/components/studio-preview'
import StudioResult from '@/features/studio/components/studio-result'
import StudioReview from '@/features/studio/components/studio-review'
import StudioSceneDialog from '@/features/studio/components/studio-scene-dialog'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { useStudioDesigner } from '@/features/studio/hooks/use-studio-designer'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function StudioDesigner({ family }: { family: ProductFamily }) {
  const t = useTranslations('studio')
  const [sceneOpen, setSceneOpen] = useState(false)
  const {
    control,
    product,
    parentProduct,
    parentIngredients,
    step,
    maxStep,
    generationStatus,
    generationStage,
    added,
    addToBag,
    buyNow,
    isAddToBagDisabled,
    isBuyNowDisabled,
    versions,
    activeVersionId,
    mockup,
    selectedMockupId,
    variantOptions,
    selectedProductId,
    styleOptions,
    ribbonOptions,
    wrapOptions,
    sceneOptions,
    isGettingStyleOptions,
    isGettingRibbonOptions,
    isGettingWrapOptions,
    isGettingSceneOptions,
    isGettingMoreStyleOptions,
    isGettingMoreRibbonOptions,
    isGettingMoreWrapOptions,
    isGettingMoreSceneOptions,
    hasMoreStyleOptions,
    hasMoreRibbonOptions,
    hasMoreWrapOptions,
    hasMoreSceneOptions,
    loadMoreStyleOptions,
    loadMoreRibbonOptions,
    loadMoreWrapOptions,
    loadMoreSceneOptions,
    trimmedName,
    nameValid,
    bouquet,
    setStep,
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
  } = useStudioDesigner(family)

  const canContinue = step === 1 ? nameValid : step === 2 ? true : Boolean(selectedMockupId)

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
          product={step === 1 ? parentProduct : product}
          step={step}
          status={generationStatus}
          stage={generationStage}
          mockup={mockup}
          bouquet={bouquet}
          designName={trimmedName}
          versions={versions}
          activeVersionId={activeVersionId}
          added={added}
          isAddToBagDisabled={isAddToBagDisabled}
          isBuyNowDisabled={isBuyNowDisabled}
          onSelectVersion={selectVersion}
          onAddToBag={addToBag}
          onBuyNow={buyNow}
        />

        <section className='relative bg-background lg:order-1 lg:h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:border-r lg:border-secondary/40'>
          <div className='mx-auto flex min-h-full max-w-4xl flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 xl:px-10'>
            {step === 1 ? (
              <StudioIngredientsStep
                control={control}
                product={parentProduct}
                ingredients={parentIngredients}
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
                    description={t('scene.chooseNote', { count: sceneOptions.length })}
                    actions={desktopNav}
                  />

                  <StudioMockupGrid
                    mockups={sceneOptions}
                    selectedId={selectedMockupId}
                    onSelect={selectMockup}
                    onExpand={() => setSceneOpen(true)}
                  />

                  <div className='mt-4 flex justify-center'>
                    <StudioOptionsFooter
                      count={sceneOptions.length}
                      loading={isGettingSceneOptions}
                      loadingMore={isGettingMoreSceneOptions}
                      hasMore={hasMoreSceneOptions}
                      onLoadMore={() => loadMoreSceneOptions()}
                    />
                  </div>
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
                version={versions.find((item) => item.id === activeVersionId)}
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
        isAddToBagDisabled={isAddToBagDisabled}
        isBuyNowDisabled={isBuyNowDisabled}
        onNext={goNext}
        onBack={goBack}
        onAddToBag={addToBag}
        onBuyNow={buyNow}
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
