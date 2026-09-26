'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { FEATURE_UNAVAILABLE_KEY } from '@/shared/feature-flags'
import { useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Toast for a blocked action - the counterpart of `FeatureUnavailableNotice` for
 * handlers that are reached anyway (keyboard, stale bundle, direct call).
 */
export const useFeatureUnavailableToast = () => {
  const { t } = useTranslation()

  return useCallback(() => toast.error(t(FEATURE_UNAVAILABLE_KEY)), [t])
}
