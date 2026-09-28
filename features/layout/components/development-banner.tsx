'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { IS_UNDER_DEVELOPMENT } from '@/shared/feature-flags'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

/** Per half - enough to fill a wide viewport once `min-w-[100vw]` has spread them. */
const ITEMS_PER_HALF = 3

/**
 * Notice band sitting above the nav while the store is being prepared. It goes
 * away on its own once ordering, payment and external services are all switched
 * back on (see shared/feature-flags) - there is no second switch to remember.
 * `HeaderSpacer` reserves the extra height, so keep the two in step if `h-10`
 * ever changes.
 *
 * The band colour and its sheen live on `.dev-stripe` in globals.css, next to the
 * other decorative animations.
 */
export default function DevelopmentBanner() {
  const { t } = useTranslation()

  if (!IS_UNDER_DEVELOPMENT) return null

  const message = t('header.developmentBanner')

  // Two identical halves: `animate-marquee` shifts the track by -50%, which lands
  // the second half exactly where the first started, so the loop has no seam.
  // Reversed, so the text travels left to right.
  const half = (
    <div className='flex min-w-[100vw] shrink-0 items-center justify-around'>
      {Array.from({ length: ITEMS_PER_HALF }, (_, index) => (
        <span
          key={index}
          className='flex items-center gap-3 px-8 font-title text-[0.72rem] tracking-[0.3em] whitespace-nowrap uppercase sm:text-[0.8rem]'
        >
          <HugeiconsIcon icon={FlowerIcon} strokeWidth={1.6} className='size-3.5 shrink-0 text-secondary' />
          {message}
          <span className='glow-pulse size-1 shrink-0 rounded-full bg-secondary' />
        </span>
      ))}
    </div>
  )

  return (
    <div className='dev-stripe relative z-10 h-10 overflow-hidden border-b border-secondary/25 shadow-[0_0.4rem_1.4rem_rgb(81_108_108/18%)]'>
      {/* The marquee repeats itself; screen readers get the sentence once. */}
      <p className='sr-only'>{message}</p>

      {/* Masked on its own layer, not on the band: the mask has to measure the
          viewport, and the track inside it is far wider than that. */}
      <div
        aria-hidden='true'
        className='absolute inset-0 z-10'
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'
        }}
      >
        <div className='flex h-full w-max animate-marquee [animation-direction:reverse] [animation-duration:32s] hover:[animation-play-state:paused]'>
          {half}
          {half}
        </div>
      </div>
    </div>
  )
}
