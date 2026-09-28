'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export type CheckoutStep = 1 | 2 | 3 | 4 | 5

const STEPS: { step: CheckoutStep; labelKey: I18nKey }[] = [
  { step: 1, labelKey: 'orders.checkout.stepPersonal' },
  { step: 2, labelKey: 'orders.checkout.stepCards' },
  { step: 3, labelKey: 'orders.checkout.stepPayment' },
  { step: 4, labelKey: 'orders.checkout.stepReview' },
  { step: 5, labelKey: 'orders.checkout.stepComplete' }
]

export default function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-center gap-2 sm:gap-4'>
      {STEPS.map(({ step, labelKey }, index) => {
        const isCompleted = current > step
        const isActive = current === step
        const isReached = isCompleted || isActive

        return (
          <div key={step} className='flex items-center gap-2 sm:gap-4'>
            <div className='flex items-center gap-2'>
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors',
                  isReached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-3.5' /> : step}
              </span>

              <span
                className={cn(
                  'text-sm font-medium transition-colors sm:inline',
                  isActive ? 'inline' : 'hidden',
                  isReached ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {t(labelKey)}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span className={cn('h-px w-4 sm:w-8 transition-colors', current > step ? 'bg-primary' : 'bg-border')} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
