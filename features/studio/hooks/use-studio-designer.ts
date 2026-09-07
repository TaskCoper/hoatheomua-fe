'use client'

import { studioProduct as product, studioIngredients, studioMockups } from '@/features/studio/studio-data'
import type { StudioGenerationStatus, StudioStep, StudioVersion } from '@/features/studio/types'
import { createStudioSchema, STUDIO_NAME_MAX_LENGTH, type StudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

export function useStudioDesigner() {
  const { t: tRoot } = useTranslation()
  const [step, setStep] = useState<StudioStep>(1)
  const [maxStep, setMaxStep] = useState<StudioStep>(1)
  const [generationStatus, setGenerationStatus] = useState<StudioGenerationStatus>('idle')
  const [generationStage, setGenerationStage] = useState(0)
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)
  const [versions, setVersions] = useState<StudioVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState('')

  const versionCount = useRef(0)

  const studioSchema = useMemo(() => createStudioSchema(tRoot), [tRoot])
  const { control, setValue, getValues, handleSubmit } = useForm<StudioFormValues>({
    resolver: zodResolver(studioSchema),
    defaultValues: { name: '', mockupId: '', productId: product.id }
  })

  const designName = useWatch({ control, name: 'name' })
  const selectedMockupId = useWatch({ control, name: 'mockupId' })

  const mockup = studioMockups.find((item) => item.id === selectedMockupId)
  const productIngredients = studioIngredients.filter((item) => product.ingredientIds.includes(item.id))
  const trimmedName = designName.trim()
  const nameValid = trimmedName.length >= 2 && designName.length <= STUDIO_NAME_MAX_LENGTH

  const goTo = (nextStep: StudioStep) => {
    setStep(nextStep)
    setMaxStep((current) => Math.max(current, nextStep) as StudioStep)
  }
  const goNext = () => goTo(Math.min(step + 1, 4) as StudioStep)
  const goBack = () => setStep((current) => Math.max(1, current - 1) as StudioStep)

  const markChanged = () => {
    setSaved(false)
    setGenerationStatus('idle')
    setActiveVersionId('')
  }

  const selectMockup = (id: string) => {
    setValue('mockupId', id, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const startGeneration = handleSubmit(() => {
    setGenerationStage(0)
    setGenerationStatus('generating')
    setActiveVersionId('')
    setAdded(false)
  })

  const selectVersion = (version: StudioVersion) => {
    setActiveVersionId(version.id)
    setValue('name', version.name, { shouldValidate: true })
    setValue('mockupId', version.mockupId, { shouldValidate: true })
    setSaved(false)
    setAdded(false)
    setGenerationStatus('complete')
    setStep(4)
    setMaxStep(4)
  }

  useEffect(() => {
    if (generationStatus !== 'generating') return
    const interval = window.setInterval(() => setGenerationStage((current) => Math.min(current + 1, 3)), 650)

    const timeout = window.setTimeout(() => {
      const values = getValues()
      const scene = studioMockups.find((item) => item.id === values.mockupId)
      versionCount.current += 1
      const version: StudioVersion = {
        id: `version-${versionCount.current}`,
        label: versionCount.current,
        name: values.name.trim(),
        mockupId: values.mockupId,
        mockupName: scene?.name ?? '',
        imageUrl: scene?.imageUrl ?? product.imageUrl
      }
      setVersions((current) => [...current, version])
      setActiveVersionId(version.id)
      setGenerationStatus('complete')
      setStep(4)
      setMaxStep(4)
    }, 2800)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [generationStatus, getValues])

  return {
    control,
    step,
    maxStep,
    generationStatus,
    generationStage,
    saved,
    added,
    versions,
    activeVersionId,
    mockup,
    selectedMockupId,
    productIngredients,
    trimmedName,
    nameValid,
    setStep,
    setAdded,
    goTo,
    goNext,
    goBack,
    markChanged,
    selectMockup,
    selectVersion,
    startGeneration
  }
}
