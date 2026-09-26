'use client'

import { useRegenerateAiFlower } from '@/features/studio/hooks/use-regenerate-ai-flower'
import {
  STUDIO_SESSION_LAST_STEP,
  STUDIO_SESSION_SCENE_STEP,
  STUDIO_SESSION_STYLE_STEP
} from '@/features/studio/studio-data'
import { toStudioReferenceOptions } from '@/features/studio/studio-mappers'
import type { AiFlower, StudioStep, StudioVersion } from '@/features/studio/types'
import { useGetInfiniteReferenceFlowers } from '@/hooks/use-get-infinite-reference-flowers'
import { useEffect, useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'

interface StudioRegenerateProps {
  activeVersion: StudioVersion | undefined
  onRegenerated: (flower: AiFlower) => void
}

export const useStudioRegenerate = ({ activeVersion, onRegenerated }: StudioRegenerateProps) => {
  const [step, setStep] = useState<StudioStep>(STUDIO_SESSION_LAST_STEP)
  const [openedStep, setOpenedStep] = useState<StudioStep | 0>(0)
  const reach = (next: StudioStep) => setOpenedStep((current) => (next > current ? next : current))

  const {
    methods: { control, reset, setValue },
    regenerate,
    generationStage,
    isRegeneratingAiFlower
  } = useRegenerateAiFlower({
    flowerId: activeVersion?.id ?? '',
    onRegenerated: (flower) => {
      setStep(STUDIO_SESSION_LAST_STEP)
      onRegenerated(flower)
    }
  })

  const {
    referenceFlowers: bundles,
    isGettingReferenceFlowers: isGettingStyleOptions,
    isGettingMoreReferenceFlowers: isGettingMoreStyleOptions,
    hasMoreReferenceFlowers: hasMoreStyleOptions,
    loadMoreReferenceFlowers: loadMoreStyleOptions
  } = useGetInfiniteReferenceFlowers({ type: 'bundle', enabled: openedStep >= STUDIO_SESSION_STYLE_STEP })
  const {
    referenceFlowers: sceneFlowers,
    isGettingReferenceFlowers: isGettingSceneOptions,
    isGettingMoreReferenceFlowers: isGettingMoreSceneOptions,
    hasMoreReferenceFlowers: hasMoreSceneOptions,
    loadMoreReferenceFlowers: loadMoreSceneOptions
  } = useGetInfiniteReferenceFlowers({ type: 'flower', enabled: openedStep >= STUDIO_SESSION_SCENE_STEP })

  const styleOptions = useMemo(() => toStudioReferenceOptions(bundles), [bundles])
  const sceneOptions = useMemo(() => toStudioReferenceOptions(sceneFlowers), [sceneFlowers])

  const selectedStyleId = useWatch({ control, name: 'bundleId' })
  const selectedSceneId = useWatch({ control, name: 'mockupId' })

  const versionStyleId = activeVersion?.style?.id ?? ''
  const versionSceneId = activeVersion?.mockupId ?? ''

  useEffect(() => {
    reset({ bundleId: versionStyleId, mockupId: versionSceneId })
  }, [reset, versionSceneId, versionStyleId])

  const goTo = (next: StudioStep) => {
    reach(next)
    setStep(next)
  }
  const goNext = () => goTo(Math.min(step + 1, STUDIO_SESSION_LAST_STEP) as StudioStep)
  const cancel = () => {
    reset({ bundleId: versionStyleId, mockupId: versionSceneId })
    setStep(STUDIO_SESSION_LAST_STEP)
  }

  const goBack = () => (step === STUDIO_SESSION_STYLE_STEP ? cancel() : setStep((step - 1) as StudioStep))

  const canContinue =
    step === STUDIO_SESSION_STYLE_STEP
      ? Boolean(selectedStyleId)
      : step === STUDIO_SESSION_SCENE_STEP
        ? Boolean(selectedSceneId)
        : false

  return {
    step,
    canContinue,
    regenerate,
    generationStage,
    isRegeneratingAiFlower,
    styleOptions,
    sceneOptions,
    selectedStyleId,
    selectedSceneId,
    selectedScene: sceneOptions.find((item) => item.id === selectedSceneId),
    isGettingStyleOptions,
    isGettingSceneOptions,
    isGettingMoreStyleOptions,
    isGettingMoreSceneOptions,
    hasMoreStyleOptions,
    hasMoreSceneOptions,
    loadMoreStyleOptions,
    loadMoreSceneOptions,
    goTo,
    goNext,
    goBack,
    cancel,
    openRegenerate: () => {
      reach(STUDIO_SESSION_STYLE_STEP)
      setStep(STUDIO_SESSION_STYLE_STEP)
    },
    selectStyle: (id: string) => setValue('bundleId', id, { shouldDirty: true, shouldValidate: true }),
    selectScene: (id: string) => setValue('mockupId', id, { shouldDirty: true, shouldValidate: true })
  }
}
