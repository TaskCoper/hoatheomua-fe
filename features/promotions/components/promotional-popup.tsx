'use client'

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PromotionCarousel from '@/features/promotions/components/promotion-carousel'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { PromotionPopupItem } from '@/types/config.type'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { VisuallyHidden } from 'radix-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface PromotionalPopupProps {
  isOpen: boolean
  campaigns: readonly PromotionPopupItem[]
  dismiss: () => void
  closeSilently: () => void
}

const EMPTY_FAILED: ReadonlySet<string> = new Set()

const CONTENT_CLASS = [
  'gap-0 border-0 bg-transparent p-0 shadow-none ring-0 outline-none',
  'w-[calc(100vw-2rem)] max-w-[420px] sm:max-w-[420px]',
  'max-h-[85svh] sm:max-h-[80vh]',
  'overflow-visible overflow-y-visible',
  'motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100'
].join(' ')

// Dark glass, not white: it sits directly on the artwork, avoiding white-on-white.
const CLOSE_CLASS =
  'absolute right-2.5 top-[max(0.625rem,env(safe-area-inset-top))] z-20 inline-flex size-8 items-center justify-center rounded-full bg-black/35 text-white shadow-lg transition-colors supports-backdrop-filter:backdrop-blur-md hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none'

// Ring + soft shadow so the card lifts off the blurred overlay.
const FRAME_CLASS = [
  'relative flex w-full flex-col overflow-hidden rounded-3xl bg-popover',
  'ring-1 ring-black/5 shadow-[0_24px_60px_-12px_rgb(31_45_45/0.45),0_8px_20px_-8px_rgb(31_45_45/0.3)]'
].join(' ')

export default function PromotionalPopup({ isOpen, campaigns, dismiss, closeSilently }: PromotionalPopupProps) {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(EMPTY_FAILED)

  const visible = useMemo(() => campaigns.filter((campaign) => !failedIds.has(campaign.id)), [campaigns, failedIds])

  const markFailed = useCallback((id: string) => {
    setFailedIds((previous) => (previous.has(id) ? previous : new Set(previous).add(id)))
  }, [])

  useEffect(() => {
    if (isOpen && campaigns.length > 0 && visible.length === 0) {
      closeSilently()
    }
  }, [isOpen, campaigns.length, visible.length, closeSilently])

  if (campaigns.length === 0) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={CONTENT_CLASS}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          // Focus the close button, not a campaign link, so a stray Enter can't navigate.
          event.preventDefault()
          closeRef.current?.focus()
        }}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>{t('promoPopup.title')}</DialogTitle>
        </VisuallyHidden.Root>

        <div className={FRAME_CLASS}>
          <DialogClose asChild>
            {/* The built-in close button is size-8; 44px is the minimum touch target. */}
            <button ref={closeRef} type='button' aria-label={t('promoPopup.close')} className={CLOSE_CLASS}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className='size-5' />
            </button>
          </DialogClose>

          <PromotionCarousel campaigns={visible} onImageError={markFailed} onNavigate={dismiss} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
