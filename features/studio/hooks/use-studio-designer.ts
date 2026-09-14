'use client'

import {
  studioProduct as product,
  STUDIO_LAST_STEP,
  studioCompanionProducts,
  studioIngredients,
  studioMockups,
  studioRibbons,
  studioSizes,
  studioStyles,
  studioWraps
} from '@/features/studio/studio-data'
import type { StudioBouquet, StudioGenerationStatus, StudioStep, StudioVersion } from '@/features/studio/types'
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
    defaultValues: {
      name: '',
      mockupId: '',
      productId: product.id,
      sizeId: studioSizes[0].id,
      styleId: studioStyles[0].id,
      ribbonId: studioRibbons[0].id,
      wrapId: studioWraps[0].id,
      companionProductIds: []
    }
  })

  const designName = useWatch({ control, name: 'name' })
  const selectedMockupId = useWatch({ control, name: 'mockupId' })
  const selectedSizeId = useWatch({ control, name: 'sizeId' })
  const selectedStyleId = useWatch({ control, name: 'styleId' })
  const selectedRibbonId = useWatch({ control, name: 'ribbonId' })
  const selectedWrapId = useWatch({ control, name: 'wrapId' })
  const companionProductIds = useWatch({ control, name: 'companionProductIds' })

  const mockup = studioMockups.find((item) => item.id === selectedMockupId)
  const productIngredients = studioIngredients.filter((item) => product.ingredientIds.includes(item.id))
  const trimmedName = designName.trim()
  const nameValid = trimmedName.length >= 2 && designName.length <= STUDIO_NAME_MAX_LENGTH

  const size = studioSizes.find((item) => item.id === selectedSizeId)
  const slotCount = size?.flowerCount ?? 1

  const bouquet = useMemo<StudioBouquet>(() => {
    const selectedSize = studioSizes.find((item) => item.id === selectedSizeId)
    const companions = companionProductIds
      .map((id) => studioCompanionProducts.find((item) => item.id === id))
      .filter((item) => item !== undefined)
    const products = [product, ...companions]
    const flowersAmount = products.reduce((total, item) => total + item.priceAmount, 0)

    return {
      size: selectedSize,
      style: studioStyles.find((item) => item.id === selectedStyleId),
      ribbon: studioRibbons.find((item) => item.id === selectedRibbonId),
      wrap: studioWraps.find((item) => item.id === selectedWrapId),
      products,
      totalAmount: flowersAmount * (selectedSize?.priceMultiplier ?? 1)
    }
  }, [companionProductIds, selectedRibbonId, selectedSizeId, selectedStyleId, selectedWrapId])

  /** Every empty slot must be filled before the bouquet is a valid thing to photograph. */
  const bouquetComplete = companionProductIds.length === slotCount - 1

  const goTo = (nextStep: StudioStep) => {
    setStep(nextStep)
    setMaxStep((current) => Math.max(current, nextStep) as StudioStep)
  }
  const goNext = () => goTo(Math.min(step + 1, STUDIO_LAST_STEP) as StudioStep)
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

  const selectSize = (id: string) => {
    const nextSize = studioSizes.find((item) => item.id === id)
    setValue('sizeId', id, { shouldDirty: true, shouldValidate: true })
    // A smaller bouquet has fewer slots, so drop the companions that no longer fit.
    if (nextSize) {
      setValue('companionProductIds', getValues('companionProductIds').slice(0, nextSize.flowerCount - 1), {
        shouldDirty: true,
        shouldValidate: true
      })
    }
    markChanged()
  }

  const selectStyle = (id: string) => {
    setValue('styleId', id, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const selectRibbon = (id: string) => {
    setValue('ribbonId', id, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const selectWrap = (id: string) => {
    setValue('wrapId', id, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  /**
   * `slot` is 1-based against the companion list: slot 0 is always the base product.
   * The list stays dense - filling a later slot first simply appends, so no holes appear.
   */
  const setCompanion = (slot: number, id: string) => {
    const next = [...getValues('companionProductIds')]
    if (slot - 1 < next.length) next[slot - 1] = id
    else next.push(id)
    setValue('companionProductIds', next.slice(0, slotCount - 1), { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const removeCompanion = (slot: number) => {
    const next = getValues('companionProductIds').filter((_, index) => index !== slot - 1)
    setValue('companionProductIds', next, { shouldDirty: true, shouldValidate: true })
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
    setStep(STUDIO_LAST_STEP)
    setMaxStep(STUDIO_LAST_STEP)
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
      setStep(STUDIO_LAST_STEP)
      setMaxStep(STUDIO_LAST_STEP)
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
    bouquet,
    bouquetComplete,
    companionProductIds,
    slotCount,
    setStep,
    setAdded,
    goTo,
    goNext,
    goBack,
    markChanged,
    selectMockup,
    selectSize,
    selectStyle,
    selectRibbon,
    selectWrap,
    setCompanion,
    removeCompanion,
    selectVersion,
    startGeneration
  }
}
