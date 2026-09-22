'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import GenerationProgress from '@/shared/components/generation-progress'
import { useMemo } from 'react'
import { ORDER_CARD_STAGE_KEYS } from '../../hooks/use-order-card-designer'

interface OrderCardGenerationOverlayProps {
  versionLabel: number
  stage: number
}

export default function OrderCardGenerationOverlay({ versionLabel, stage }: OrderCardGenerationOverlayProps) {
  const { t } = useTranslation()

  const stages = useMemo(
    () => ORDER_CARD_STAGE_KEYS.map((key) => ({ key, label: t(`orders.cards.generation.stages.${key}`) })),
    [t]
  )

  return (
    <GenerationProgress
      badge={t('orders.cards.generation.badge')}
      title={t('orders.cards.generation.title', { index: versionLabel })}
      note={t('orders.cards.generation.waitNote')}
      stages={stages}
      activeStage={stage}
    />
  )
}
