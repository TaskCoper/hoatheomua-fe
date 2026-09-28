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
    <Button
      type='button'
      size='icon-lg'
      variant='outline'
      onClick={onBack}
      aria-label={tNav('back')}
      className='mr-auto'
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} />
    </Button>
  )

  const next = (
    <Button key='next' type='button' size='lg' disabled={!canContinue} onClick={onNext}>
      {tNav('next')}
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        className='transition-transform duration-300 group-hover/button:translate-x-0.5'
      />
    </Button>
  )

  if (step === 1) {
    return next
  }

  if (step === 2 || step === 3)
    return (
      <>
        {back}
        {next}
      </>
    )

  if (step === 4)
    return (
      <>
        {back}
        <Button key='generate' type='submit' size='lg' disabled={status === 'generating'}>
          {tNav('generate')}
          <HugeiconsIcon
            icon={SparklesIcon}
            className='transition-transform duration-500 group-hover/button:rotate-12'
          />
        </Button>
      </>
    )

  return status === 'complete' ? back : null
}
