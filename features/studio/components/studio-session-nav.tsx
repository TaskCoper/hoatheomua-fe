'use client'

import { Button } from '@/components/ui/button'
import { STUDIO_SESSION_SCENE_STEP, STUDIO_SESSION_STYLE_STEP } from '@/features/studio/studio-data'
import type { StudioStep } from '@/features/studio/types'
import { ArrowLeft02Icon, ArrowRight02Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

interface StudioSessionNavProps {
  step: StudioStep
  canContinue: boolean
  isRegenerating: boolean
  onNext: () => void
  onBack: () => void
}

export default function StudioSessionNav({ step, canContinue, isRegenerating, onNext, onBack }: StudioSessionNavProps) {
  const tNav = useTranslations('studio.nav')
  const tRegenerate = useTranslations('studio.regenerate')

  if (step !== STUDIO_SESSION_STYLE_STEP && step !== STUDIO_SESSION_SCENE_STEP) return null

  return (
    <>
      <Button type='button' size='lg' variant='outline' onClick={onBack} disabled={isRegenerating}>
        <HugeiconsIcon icon={ArrowLeft02Icon} />
        {tNav('back')}
      </Button>

      {step === STUDIO_SESSION_STYLE_STEP ? (
        <Button type='button' size='lg' disabled={!canContinue} onClick={onNext}>
          {tNav('next')}
          <HugeiconsIcon icon={ArrowRight02Icon} />
        </Button>
      ) : (
        <Button type='submit' size='lg' disabled={!canContinue || isRegenerating}>
          {isRegenerating ? tRegenerate('submitting') : tRegenerate('submit')}
          <HugeiconsIcon icon={SparklesIcon} />
        </Button>
      )}
    </>
  )
}
