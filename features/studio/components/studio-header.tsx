'use client'

import { Button } from '@/components/ui/button'
import { STUDIO_STEP_KEYS, type StudioStepKey } from '@/features/studio/studio-data'
import type { StudioStep } from '@/features/studio/types'
import { Link } from '@/lib/i18n/navigation'
import logo from '@/public/images/logo.png'
import { cn } from '@/shared/utils'
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface StudioHeaderProps {
  step: StudioStep
  maxStep: StudioStep
  onStep: (step: StudioStep) => void
  steps?: readonly { step: StudioStep; key: StudioStepKey }[]
}

export default function StudioHeader({ step, maxStep, onStep, steps = STUDIO_STEP_KEYS }: StudioHeaderProps) {
  const t = useTranslations('studio.header')
  const tSteps = useTranslations('studio.steps')

  return (
    <header className='relative z-40 flex h-18 shrink-0 items-center border-b border-secondary/40 bg-background/85 px-2 backdrop-blur-md sm:px-4 lg:h-20 lg:px-6'>
      <Link
        href='/'
        aria-label={t('homeAriaLabel')}
        className='shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      >
        <Image src={logo} alt={t('logoAlt')} priority sizes='48px' className='h-10 w-auto lg:h-12' />
      </Link>

      <nav aria-label={t('progressAriaLabel')} className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <ol className='flex items-center'>
          {steps.map((item, index) => {
            const complete = item.step < step
            const active = item.step === step
            const available = item.step <= maxStep
            const label = tSteps(item.key)

            return (
              <li key={item.step} className='flex items-center'>
                <button
                  type='button'
                  onClick={() => available && onStep(item.step)}
                  disabled={!available}
                  aria-current={active ? 'step' : undefined}
                  aria-label={t('stepAriaLabel', { step: item.step, label })}
                  className={cn(
                    'flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none sm:px-2.5',
                    active
                      ? 'text-primary'
                      : available
                        ? 'text-primary/70 hover:text-primary'
                        : 'text-muted-foreground/70'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border text-[0.625rem] font-semibold transition-colors',
                      active && 'border-primary bg-primary text-primary-foreground',
                      complete && 'border-secondary bg-secondary text-secondary-foreground',
                      !active && !complete && 'border-border'
                    )}
                  >
                    {complete ? <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} /> : item.step}
                  </span>
                  <span className='hidden whitespace-nowrap md:inline'>{label}</span>
                </button>

                {index < steps.length - 1 ? (
                  <span
                    aria-hidden='true'
                    className={cn(
                      'mx-0.5 h-px w-3 transition-colors sm:w-5',
                      item.step < step ? 'bg-primary/40' : 'bg-border'
                    )}
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className='flex flex-1 items-center justify-end gap-1'>
        <Button asChild variant='ghost' size='icon-lg' className='text-primary'>
          <Link href='/products' aria-label={t('exitAriaLabel')}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </header>
  )
}
