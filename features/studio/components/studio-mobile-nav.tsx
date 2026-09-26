'use client'

import { Button } from '@/components/ui/button'
import type { StudioGenerationStatus, StudioStep } from '@/features/studio/types'
import { ArrowLeft02Icon, ArrowRight02Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

interface StudioMobileNavProps {
  step: StudioStep
  status: StudioGenerationStatus
  canContinue: boolean
  added: boolean
  isAddToBagDisabled?: boolean
  isBuyNowDisabled?: boolean
  onNext: () => void
  onBack: () => void
  onAddToBag: () => void
  onBuyNow: () => void
}

export default function StudioMobileNav({
  step,
  status,
  canContinue,
  added,
  isAddToBagDisabled = false,
  isBuyNowDisabled = false,
  onNext,
  onBack,
  onAddToBag,
  onBuyNow
}: StudioMobileNavProps) {
  const tNav = useTranslations('studio.nav')

  const backButton = (label: string) => (
    <Button type='button' size='icon-lg' variant='outline' onClick={onBack} aria-label={label}>
      <HugeiconsIcon icon={ArrowLeft02Icon} />
    </Button>
  )

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 border-t border-secondary/40 bg-background/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden'>
      {step === 1 ? (
        <Button type='button' size='lg' disabled={!canContinue} onClick={onNext} className='w-full'>
          {tNav('next')}
          <HugeiconsIcon icon={ArrowRight02Icon} />
        </Button>
      ) : null}

      {step === 2 || step === 3 ? (
        <div className='grid grid-cols-[auto_1fr] gap-2'>
          {backButton(step === 2 ? tNav('backToIngredients') : tNav('backToCompose'))}
          <Button type='button' size='lg' disabled={!canContinue} onClick={onNext}>
            {tNav('next')}
            <HugeiconsIcon icon={ArrowRight02Icon} />
          </Button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className='grid grid-cols-[auto_1fr] gap-2'>
          {backButton(tNav('backToMockups'))}
          <Button type='submit' size='lg' disabled={status === 'generating'}>
            {tNav('generate')}
            <HugeiconsIcon icon={SparklesIcon} />
          </Button>
        </div>
      ) : null}

      {step === 5 && status === 'complete' ? (
        <div className='grid grid-cols-[auto_1.35fr_1fr] gap-2'>
          {backButton(tNav('backToReview'))}
          <Button type='button' size='lg' onClick={onAddToBag} disabled={isAddToBagDisabled}>
            {added ? tNav('addedToBag') : tNav('addToBag')}
          </Button>
          <Button type='button' size='lg' variant='secondary' onClick={onBuyNow} disabled={isBuyNowDisabled}>
            {tNav('buyNow')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
