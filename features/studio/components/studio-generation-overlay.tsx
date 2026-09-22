'use client'

import { STUDIO_GENERATION_STAGE_KEYS } from '@/features/studio/studio-data'
import GenerationProgress from '@/shared/components/generation-progress'
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
    <GenerationProgress
      badge={t('generating')}
      title={t('creating', { name })}
      note={t('waitNote')}
      stages={stages}
      activeStage={stage}
      className='pb-20 sm:pb-24'
    />
  )
}
