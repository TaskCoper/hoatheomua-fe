'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import StudioHeader from '@/features/studio/components/studio-header'
import StudioMobileNav from '@/features/studio/components/studio-mobile-nav'
import StudioPreview from '@/features/studio/components/studio-preview'
import StudioRegeneratePanel from '@/features/studio/components/studio-regenerate-panel'
import StudioResult from '@/features/studio/components/studio-result'
import StudioSceneDialog from '@/features/studio/components/studio-scene-dialog'
import StudioSessionNav from '@/features/studio/components/studio-session-nav'
import { useStudioRegenerate } from '@/features/studio/hooks/use-studio-regenerate'
import { useStudioSession } from '@/features/studio/hooks/use-studio-session'
import {
  STUDIO_GENERATION_DONE_STAGE,
  STUDIO_LAST_STEP,
  STUDIO_SESSION_LAST_STEP,
  STUDIO_SESSION_STEP_KEYS,
  STUDIO_VERSION_QUERY_KEY
} from '@/features/studio/studio-data'
import type { StudioVersion } from '@/features/studio/types'
import { Link } from '@/lib/i18n/navigation'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

interface StudioSessionClientProps {
  productId: string
  sessionId: string
}

export default function StudioSessionClient({ productId, sessionId }: StudioSessionClientProps) {
  const t = useTranslations('studio')
  const tSession = useTranslations('studio.session')
  const tRegenerate = useTranslations('studio.regenerate')

  const [sceneOpen, setSceneOpen] = useState(false)

  const {
    product,
    mockup,
    bouquet,
    designName,
    versions,
    activeVersion,
    activeVersionId,
    added,
    addToBag,
    buyNow,
    isAddToBagDisabled,
    isBuyNowDisabled,
    selectVersion,
    isGettingSession,
    isSessionError
  } = useStudioSession({ productId, sessionId })

  const {
    step,
    canContinue,
    regenerate,
    generationStage,
    isRegeneratingAiFlower,
    styleOptions,
    sceneOptions,
    selectedStyleId,
    selectedSceneId,
    selectedScene,
    isGettingStyleOptions,
    isGettingSceneOptions,
    isGettingMoreStyleOptions,
    isGettingMoreSceneOptions,
    hasMoreStyleOptions,
    hasMoreSceneOptions,
    loadMoreStyleOptions,
    loadMoreSceneOptions,
    goTo,
    goNext,
    goBack,
    openRegenerate,
    selectStyle,
    selectScene
  } = useStudioRegenerate({
    activeVersion,
    onRegenerated: (flower) => selectVersion({ id: flower.id })
  })

  const studioHref = `/products/${productId}/studio`
  const onResultStep = step === STUDIO_SESSION_LAST_STEP

  if (isGettingSession)
    return (
      <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-background'>
        <Spinner className='size-8 text-muted-foreground' />
        <p className='text-xs text-muted-foreground'>{tSession('loading')}</p>
      </div>
    )

  if (isSessionError || !product || !bouquet)
    return (
      <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-background px-6 text-center'>
        <h1 className='text-pretty font-title text-2xl font-bold leading-tight text-primary'>{t('unavailable')}</h1>
        <p className='max-w-md text-xs leading-relaxed text-muted-foreground'>{t('unavailableNote')}</p>
        <Button asChild size='lg' className='mt-2'>
          <Link href='/products'>{t('backToProducts')}</Link>
        </Button>
      </div>
    )

  if (!activeVersion)
    return (
      <div className='flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-background px-6 text-center'>
        <HugeiconsIcon icon={AiMagicIcon} className='size-8 text-primary/40' />
        <h1 className='text-pretty font-title text-2xl font-bold leading-tight text-primary'>
          {tSession('emptyTitle')}
        </h1>
        <p className='max-w-md text-xs leading-relaxed text-muted-foreground'>{tSession('emptyBody')}</p>
        <Button asChild size='lg' className='mt-2'>
          <Link href={studioHref}>{tSession('backToStudio')}</Link>
        </Button>
      </div>
    )

  const previewScene = onResultStep ? mockup : (selectedScene ?? mockup)
  const sessionNav = (
    <StudioSessionNav
      step={step}
      canContinue={canContinue}
      isRegenerating={isRegeneratingAiFlower}
      onNext={goNext}
      onBack={goBack}
    />
  )

  return (
    <form onSubmit={regenerate} className='flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground'>
      <StudioHeader
        step={step}
        maxStep={STUDIO_SESSION_LAST_STEP}
        steps={STUDIO_SESSION_STEP_KEYS}
        onStep={(next) => goTo(next)}
      />

      {/* A cart line points at the version it was bought from, not the newest one. */}
      <Suspense fallback={null}>
        <StudioVersionQuerySync versions={versions} onSelect={selectVersion} />
      </Suspense>

      <main className='grid flex-1 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(30rem,5fr)_minmax(0,6fr)]'>
        <StudioPreview
          product={product}
          step={onResultStep ? STUDIO_LAST_STEP : 3}
          status={isRegeneratingAiFlower ? 'generating' : 'complete'}
          stage={isRegeneratingAiFlower ? generationStage : STUDIO_GENERATION_DONE_STAGE}
          mockup={previewScene}
          bouquet={bouquet}
          designName={designName}
          versions={versions}
          activeVersionId={activeVersionId}
          added={added}
          isAddToBagDisabled={isAddToBagDisabled}
          isBuyNowDisabled={isBuyNowDisabled}
          productOverlay={false}
          onSelectVersion={selectVersion}
          onAddToBag={addToBag}
          onBuyNow={buyNow}
        />

        <section className='relative bg-background lg:order-1 lg:h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:border-r lg:border-secondary/40'>
          <div className='mx-auto flex min-h-full max-w-4xl flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 xl:px-10'>
            {onResultStep ? (
              <StudioResult
                product={product}
                mockup={mockup}
                bouquet={bouquet}
                designName={designName}
                status='complete'
                version={activeVersion}
                createAnotherTitle={tRegenerate('cta')}
                createAnotherNote={tRegenerate('ctaNote')}
                onCreateAnother={openRegenerate}
              />
            ) : (
              <StudioRegeneratePanel
                step={step}
                product={product}
                bouquet={bouquet}
                designName={designName}
                styleOptions={styleOptions}
                sceneOptions={sceneOptions}
                selectedStyleId={selectedStyleId}
                selectedSceneId={selectedSceneId}
                isGettingStyleOptions={isGettingStyleOptions}
                isGettingSceneOptions={isGettingSceneOptions}
                isGettingMoreStyleOptions={isGettingMoreStyleOptions}
                isGettingMoreSceneOptions={isGettingMoreSceneOptions}
                hasMoreStyleOptions={hasMoreStyleOptions}
                hasMoreSceneOptions={hasMoreSceneOptions}
                isRegenerating={isRegeneratingAiFlower}
                actions={sessionNav}
                onLoadMoreStyleOptions={() => loadMoreStyleOptions()}
                onLoadMoreSceneOptions={() => loadMoreSceneOptions()}
                onSelectStyle={selectStyle}
                onSelectScene={selectScene}
                onExpandScene={() => setSceneOpen(true)}
              />
            )}
          </div>
        </section>
      </main>

      {onResultStep ? (
        <StudioMobileNav
          step={STUDIO_LAST_STEP}
          status='complete'
          canContinue={false}
          added={added}
          isAddToBagDisabled={isAddToBagDisabled}
          isBuyNowDisabled={isBuyNowDisabled}
          onNext={openRegenerate}
          onBack={goBack}
          onAddToBag={addToBag}
          onBuyNow={buyNow}
        />
      ) : (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-secondary/40 bg-background/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden'>
          <div className='flex items-center gap-2 [&>button:last-child]:flex-1'>{sessionNav}</div>
        </div>
      )}

      {previewScene ? (
        <StudioSceneDialog
          mockup={previewScene}
          product={product}
          designName={designName}
          open={sceneOpen}
          onOpenChange={setSceneOpen}
        />
      ) : null}
    </form>
  )
}

function StudioVersionQuerySync({
  versions,
  onSelect
}: {
  versions: StudioVersion[]
  onSelect: (version: { id: string }) => void
}) {
  const searchParams = useSearchParams()
  const requestedId = searchParams.get(STUDIO_VERSION_QUERY_KEY)
  const exists = versions.some((version) => version.id === requestedId)

  // Once only: the carousel owns the choice from here, so arriving on a link must not
  // keep snapping the screen back to it.
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current || !requestedId || !exists) return

    appliedRef.current = true
    onSelect({ id: requestedId })
  }, [requestedId, exists, onSelect])

  return null
}
