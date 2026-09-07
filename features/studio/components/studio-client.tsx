'use client'

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
import { studioProduct as product, studioMockups } from '@/features/studio/studio-data'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function StudioClient() {
  const t = useTranslations('studio')
  const [sceneOpen, setSceneOpen] = useState(false)
  const {
    control,
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
    trimmedName,
    nameValid,
    setStep,
    setAdded,
    goTo,
    goNext,
    goBack,
    markChanged,
    selectMockup,
    selectVersion,
    startGeneration
  } = useStudioDesigner()

  const canContinue = step === 1 ? nameValid : Boolean(selectedMockupId)
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
                <section className='mt-7'>
                  <StudioStepHeading
                    title={t('step2.chooseTitle')}
                    description={t('step2.chooseNote', { count: studioMockups.length })}
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

            {step === 3 ? (
              <StudioReview
                product={product}
                ingredients={productIngredients}
                mockup={mockup}
                designName={trimmedName}
                actions={desktopNav}
              />
            ) : null}

            {step === 4 ? (
              <StudioResult
                product={product}
                ingredients={productIngredients}
                mockup={mockup}
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
