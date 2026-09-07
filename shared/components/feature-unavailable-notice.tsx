'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { FEATURE_UNAVAILABLE_KEY } from '@/shared/feature-flags'
import { cn } from '@/shared/utils'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

/**
 * The only place the "temporarily unavailable" wording is rendered, so every
 * switched-off surface (buy now, checkout, payment, cancel) says the same thing.
 */
export function FeatureUnavailableNotice({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div
      role='status'
      className={cn('flex items-start gap-2 rounded-2xl bg-muted/60 px-3 py-2.5 ring-1 ring-foreground/5', className)}
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        strokeWidth={2}
        className='mt-0.5 size-3.5 shrink-0 text-muted-foreground'
      />
      <p className='text-xs leading-relaxed text-muted-foreground'>{t(FEATURE_UNAVAILABLE_KEY)}</p>
    </div>
  )
}
