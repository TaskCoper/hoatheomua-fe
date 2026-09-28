'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ARE_CARDS_ENABLED } from '../../cards/card-feature'

export type CheckoutStep = 1 | 2 | 3 | 4 | 5

export const CHECKOUT_CARDS_STEP: CheckoutStep = 2

const ALL_STEPS: { step: CheckoutStep; labelKey: I18nKey }[] = [
  { step: 1, labelKey: 'orders.checkout.stepPersonal' },
  { step: CHECKOUT_CARDS_STEP, labelKey: 'orders.checkout.stepCards' },
  { step: 3, labelKey: 'orders.checkout.stepPayment' },
  { step: 4, labelKey: 'orders.checkout.stepReview' },
  { step: 5, labelKey: 'orders.checkout.stepComplete' }
]

const STEPS = ALL_STEPS.filter(({ step }) => ARE_CARDS_ENABLED || step !== CHECKOUT_CARDS_STEP)

export const CHECKOUT_STEPS: CheckoutStep[] = STEPS.map(({ step }) => step)

export default function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const { t } = useTranslation()

  const currentIndex = Math.max(
    0,
    STEPS.findIndex(({ step }) => step === current)
  )
  const currentLabel = STEPS[currentIndex]?.labelKey
  const progress = ((currentIndex + 1) / STEPS.length) * 100

  return (
    <>
      <div className='sm:hidden'>
        <div className='flex items-baseline justify-between gap-3'>
          <p className='min-w-0 truncate text-sm font-semibold text-foreground'>
            {currentLabel ? t(currentLabel) : null}
          </p>
          <p className='shrink-0 text-xs font-medium text-muted-foreground tabular-nums'>
            {t('orders.checkout.stepCounter', { current: currentIndex + 1, total: STEPS.length })}
          </p>
        </div>
        <div
          role='progressbar'
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={currentIndex + 1}
          aria-label={t('orders.checkout.title')}
          className='mt-2 h-1.5 overflow-hidden rounded-full bg-muted'
        >
          <span
            className='block h-full rounded-full bg-primary transition-[width] duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className='hidden items-center justify-center gap-2 sm:flex sm:gap-4'>
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
                  {isCompleted ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className='size-3.5' /> : index + 1}
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
                  className={cn('h-px w-4 transition-colors sm:w-8', current > step ? 'bg-primary' : 'bg-border')}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}
