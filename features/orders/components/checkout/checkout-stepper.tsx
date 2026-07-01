'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export type CheckoutStep = 1 | 2 | 3

const STEPS: { step: CheckoutStep; labelKey: 'orders.checkout.stepPersonal' | 'orders.checkout.stepPayment' | 'orders.checkout.stepComplete' }[] = [
  { step: 1, labelKey: 'orders.checkout.stepPersonal' },
  { step: 2, labelKey: 'orders.checkout.stepPayment' },
  { step: 3, labelKey: 'orders.checkout.stepComplete' }
]

export function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-center gap-3 sm:gap-6'>
      {STEPS.map(({ step, labelKey }, index) => {
        const isCompleted = current > step
        const isActive = current === step
        const isReached = isCompleted || isActive

        return (
          <div key={step} className='flex items-center gap-3 sm:gap-6'>
            <div className='flex items-center gap-2'>
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'grid size-7 place-items-center rounded-full text-xs font-semibold transition-colors',
                  isReached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-3.5' /> : step}
              </span>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isReached ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {t(labelKey)}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  'h-px w-8 sm:w-16 transition-colors',
                  current > step ? 'bg-primary' : 'bg-border'
                )}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
