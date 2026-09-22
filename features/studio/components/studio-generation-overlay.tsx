'use client'

import { STUDIO_GENERATION_STAGE_KEYS } from '@/features/studio/studio-data'
import GenerationScreenLock from '@/shared/components/generation-screen-lock'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

interface StudioGenerationOverlayProps {
  name: string
  stage: number
}

export default function StudioGenerationOverlay({ name, stage }: StudioGenerationOverlayProps) {
  const t = useTranslations('studio.generation')

  const stages = useMemo(() => STUDIO_GENERATION_STAGE_KEYS.map((key) => ({ key, label: t(`stages.${key}`) })), [t])

  return (
    <GenerationScreenLock
      badge={t('generating')}
      title={t('creating', { name })}
      note={t('lockNote')}
      stages={stages}
      activeStage={stage}
    />
  )
}
