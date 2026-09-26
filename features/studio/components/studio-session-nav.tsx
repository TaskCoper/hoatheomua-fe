'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { STUDIO_SESSION_SCENE_STEP, STUDIO_SESSION_STYLE_STEP } from '@/features/studio/studio-data'
import type { StudioStep } from '@/features/studio/types'
import { ArrowLeft02Icon, ArrowRight02Icon, Cancel01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

type StudioSessionNavVariant = 'heading' | 'footer' | 'bar'

interface StudioSessionNavProps {
  step: StudioStep
  canContinue: boolean
  isRegenerating: boolean
  variant: StudioSessionNavVariant
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

export default function StudioSessionNav({
  step,
  canContinue,
  isRegenerating,
  variant,
  onNext,
  onBack,
  onCancel
}: StudioSessionNavProps) {
  const tNav = useTranslations('studio.nav')
  const tRegenerate = useTranslations('studio.regenerate')

  if (step !== STUDIO_SESSION_STYLE_STEP && step !== STUDIO_SESSION_SCENE_STEP) return null

  const onStyleStep = step === STUDIO_SESSION_STYLE_STEP
  const submitLabel = isRegenerating ? tRegenerate('submitting') : tRegenerate('submit')

  if (variant === 'footer')
    return (
      <Button type='button' size='lg' variant='outline' onClick={onCancel} disabled={isRegenerating}>
        <HugeiconsIcon icon={Cancel01Icon} />
        {tNav('cancel')}
      </Button>
    )

  if (variant === 'bar')
    return (
      <>
        <Button type='button' size='lg' variant='outline' onClick={onCancel} disabled={isRegenerating}>
          {tNav('cancel')}
        </Button>

        {onStyleStep ? (
          <Button type='button' size='lg' disabled={!canContinue} onClick={onNext}>
            {tNav('next')}
            <HugeiconsIcon icon={ArrowRight02Icon} />
          </Button>
        ) : (
          <Button type='submit' size='lg' disabled={!canContinue || isRegenerating}>
            {submitLabel}
            {isRegenerating ? <Spinner /> : <HugeiconsIcon icon={SparklesIcon} />}
          </Button>
        )}
      </>
    )

  return (
    <>
      {onStyleStep ? null : (
        <Button
          type='button'
          size='icon-lg'
          variant='outline'
          onClick={onBack}
          disabled={isRegenerating}
          aria-label={tNav('back')}
          title={tNav('back')}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} />
        </Button>
      )}

      {onStyleStep ? (
        <Button
          type='button'
          size='icon-lg'
          className='max-lg:hidden'
          disabled={!canContinue}
          onClick={onNext}
          aria-label={tNav('next')}
          title={tNav('next')}
        >
          <HugeiconsIcon icon={ArrowRight02Icon} />
        </Button>
      ) : (
        <Button type='submit' size='lg' className='max-lg:hidden' disabled={!canContinue || isRegenerating}>
          {submitLabel}
          {isRegenerating ? <Spinner /> : <HugeiconsIcon icon={SparklesIcon} />}
        </Button>
      )}
    </>
  )
}
