'use client'

import {
  ABANDON_AFTER_MS,
  DISMISS_STORAGE_KEY,
  MAX_VISIBLE_CAMPAIGNS,
  POPUP_DELAY_MS,
  PROMOTIONS_GROUP,
  PROMOTION_POPUP_KEY
} from '@/features/promotions/constants'
import { DEFAULT_PROMOTION_POPUP } from '@/features/promotions/default-campaigns'
import { useFirstInteraction } from '@/features/promotions/hooks/use-first-interaction'
import { stripLocalePrefix } from '@/features/promotions/href'
import { parsePromotionPopup } from '@/features/promotions/parse'
import { businessToday, campaignSignature, selectActiveCampaigns } from '@/features/promotions/select-active-campaigns'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { usePathname } from '@/lib/i18n/navigation'
import type { PromotionPopupConfigItem } from '@/types/config.type'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const readDismissed = (): string | null => {
  try {
    return window.sessionStorage.getItem(DISMISS_STORAGE_KEY)
  } catch {
    // Fail open on storage errors (e.g. Safari private mode).
    return null
  }
}

const writeDismissed = (signature: string) => {
  try {
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, signature)
  } catch {
    // Acceptable degradation: popup just reappears on reload.
  }
}

const clearDismissed = () => {
  try {
    window.sessionStorage.removeItem(DISMISS_STORAGE_KEY)
  } catch {
    // Nothing to do - see above.
  }
}

export function usePromotionPopup() {
  const path = stripLocalePrefix(usePathname())
  const hasInteracted = useFirstInteraction()

  const { configs, isGettingConfigs } = useGetPublicConfigs<PromotionPopupConfigItem, 'promotions.popup'>({
    group: PROMOTIONS_GROUP,
    key: PROMOTION_POPUP_KEY,
    options: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      retry: false,
      throwOnError: false
    }
  })

  // Fallback only for missing/invalid config; a parsed `enabled: false` still applies.
  const collection = useMemo(() => parsePromotionPopup(configs[0]?.value.value) ?? DEFAULT_PROMOTION_POPUP, [configs])

  const campaigns = useMemo(
    () => selectActiveCampaigns(collection, businessToday(), path, MAX_VISIBLE_CAMPAIGNS),
    [collection, path]
  )

  const frequency = collection.section.frequency
  const signature = useMemo(() => campaignSignature(campaigns), [campaigns])

  const [isOpen, setIsOpen] = useState(false)
  const hasOpenedRef = useRef(false)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eligibleAtRef = useRef<number | null>(null)
  const arrivedLateRef = useRef(false)

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    openTimerRef.current = null
  }, [])

  // Route change restarts the abandon clock: it measures time on this page, not the site.
  useEffect(() => {
    eligibleAtRef.current = Date.now()

    return clearOpenTimer
  }, [path, clearOpenTimer])

  // Judged when the config resolves rather than when the popup is due: the visitor
  // may not interact for minutes, and that must not read as "the data was slow".
  useEffect(() => {
    if (isGettingConfigs) return

    arrivedLateRef.current = Date.now() - (eligibleAtRef.current ?? Date.now()) > ABANDON_AFTER_MS
  }, [isGettingConfigs, path])

  useEffect(() => {
    if (hasOpenedRef.current) return // shown once already - never re-open
    if (openTimerRef.current) return // already scheduled - do not restart the delay
    if (isGettingConfigs) return // data has not resolved yet
    if (!signature) return // nothing active, or nothing scoped to this page

    // The popup image is the largest element on most pages, so painting it before
    // the first input would hand it the LCP. See `useFirstInteraction`.
    if (!hasInteracted) return

    // Data arrived after the visitor started reading; a popup now is hostile.
    if (arrivedLateRef.current) return

    // `every-load` skips this gate but still writes below, so switching back
    // to once-per-session mid-session won't re-show what was already seen.
    if (frequency !== 'every-load' && readDismissed() === signature) return

    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null
      hasOpenedRef.current = true
      // Written on open, not just dismiss, to cap it at once per visit.
      writeDismissed(signature)
      setIsOpen(true)
    }, POPUP_DELAY_MS)
    // `path` re-runs this to reschedule the timer the route-change effect above cleared.
  }, [signature, frequency, isGettingConfigs, hasInteracted, path])

  /** The visitor acted: close button, ESC, overlay, or a click-through. */
  const dismiss = useCallback(() => setIsOpen(false), [])

  const closeSilently = useCallback(() => {
    setIsOpen(false)
    clearDismissed()
  }, [])

  return { isOpen, campaigns, dismiss, closeSilently, isReady: !isGettingConfigs }
}
