'use client'

import { Button } from '@/components/ui/button'
import { STUDIO_STEP_KEYS, type StudioStepKey } from '@/features/studio/studio-data'
import type { StudioStep } from '@/features/studio/types'
import { ACCOUNT_FALLBACK_HREF } from '@/features/users/account-navigation'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { Link } from '@/lib/i18n/navigation'
import logo from '@/public/images/logo.png'
import { cn } from '@/shared/utils'
import { AiMagicIcon, Cancel01Icon, ShoppingBasket03Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

// Labels unfold only once there is room beside the absolutely centred step rail.
const actionLabelClass = 'hidden xl:inline'

interface StudioHeaderProps {
  step: StudioStep
  maxStep: StudioStep
  onStep: (step: StudioStep) => void
  steps?: readonly { step: StudioStep; key: StudioStepKey }[]
  locked?: boolean
}

export default function StudioHeader({
  step,
  maxStep,
  onStep,
  steps = STUDIO_STEP_KEYS,
  locked = false
}: StudioHeaderProps) {
  const t = useTranslations('studio.header')
  const tSteps = useTranslations('studio.steps')

  const historyHref = useAccountHref('studio')

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
            const available = item.step <= maxStep && !locked
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

      <div className='flex flex-1 items-center justify-end gap-0.5 sm:gap-1'>
        <HeaderAction
          href='/cart'
          icon={ShoppingBasket03Icon}
          label={t('cartLabel')}
          description={t('cartAriaLabel')}
          locked={locked}
        />

        {historyHref === ACCOUNT_FALLBACK_HREF ? null : (
          <HeaderAction
            href={historyHref}
            icon={AiMagicIcon}
            label={t('historyLabel')}
            description={t('historyAriaLabel')}
            locked={locked}
          />
        )}

        <span aria-hidden='true' className='mx-1 h-6 w-px bg-border' />

        <HeaderAction href='/products' icon={Cancel01Icon} description={t('exitAriaLabel')} locked={locked} />
      </div>
    </header>
  )
}

/**
 * Renders either shape: pass `label` for an icon that grows a caption at `xl`, or
 * leave it out for a square icon button. `description` is the accessible name
 * either way, since the caption is hidden on smaller screens. A locked action
 * keeps its place and its shape but stops being a link.
 */
function HeaderAction({
  href,
  icon,
  label,
  description,
  locked
}: {
  href: string
  icon: typeof Cancel01Icon
  label?: string
  description: string
  locked: boolean
}) {
  // `icon-lg` is already the square 2.5rem button; a captioned one needs room to grow.
  const size = label ? 'lg' : 'icon-lg'
  const className = cn('text-primary', label && 'px-2.5 xl:px-4')

  const body = (
    <>
      <HugeiconsIcon icon={icon} strokeWidth={2} />
      {label ? <span className={actionLabelClass}>{label}</span> : null}
    </>
  )

  if (locked)
    return (
      <Button type='button' variant='ghost' size={size} className={className} disabled aria-label={description}>
        {body}
      </Button>
    )

  return (
    <Button asChild variant='ghost' size={size} className={className}>
      <Link href={href} aria-label={description} title={description}>
        {body}
      </Link>
    </Button>
  )
}
