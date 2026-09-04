'use client'

import { Button } from '@/components/ui/button'
import type { StudioGenerationStatus, StudioStep } from '@/features/studio/types'
import { ArrowLeft02Icon, ArrowRight02Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

interface StudioDesktopNavProps {
  step: StudioStep
  status: StudioGenerationStatus
  canContinue: boolean
  onNext: () => void
  onBack: () => void
}

export default function StudioDesktopNav({ step, status, canContinue, onNext, onBack }: StudioDesktopNavProps) {
  const tNav = useTranslations('studio.nav')

  const back = (
    <Button type='button' size='lg' variant='outline' onClick={onBack}>
      <HugeiconsIcon icon={ArrowLeft02Icon} />
      {tNav('back')}
    </Button>
  )

  const next = (
    <Button type='button' size='lg' disabled={!canContinue} onClick={onNext}>
      {tNav('next')}
      <HugeiconsIcon icon={ArrowRight02Icon} />
    </Button>
  )

  if (step === 1) {
    return next
  }

  if (step === 2)
    return (
      <>
        {back}
        {next}
      </>
    )

  if (step === 3)
    return (
      <>
        {back}
        <Button type='submit' size='lg' disabled={status === 'generating'}>
          {tNav('generate')}
          <HugeiconsIcon icon={SparklesIcon} />
        </Button>
      </>
    )

  return status === 'complete' ? back : null
}
