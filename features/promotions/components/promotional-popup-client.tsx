'use client'

import { usePromotionPopup } from '@/features/promotions/hooks/use-promotion-popup'
import dynamic from 'next/dynamic'

const PromotionalPopup = dynamic(() => import('@/features/promotions/components/promotional-popup'), { ssr: false })

/**
 * The scheduling lives here, outside the lazy chunk, so embla and the dialog are
 * only fetched on pages that actually have an active campaign. Everything this
 * file pulls in is plain TS - no carousel, no icons, no Radix.
 */
export default function PromotionalPopupClient() {
  const { isOpen, campaigns, dismiss, closeSilently, isReady } = usePromotionPopup()

  if (!isReady || campaigns.length === 0) return null

  return <PromotionalPopup isOpen={isOpen} campaigns={campaigns} dismiss={dismiss} closeSilently={closeSilently} />
}
