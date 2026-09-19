'use client'

import type { ProductDetail } from '@/features/products/types'
import {
  STUDIO_LAST_STEP,
  studioMockups,
  studioRibbons,
  studioStyles,
  studioWraps
} from '@/features/studio/studio-data'
import { toStudioIngredients, toStudioProduct } from '@/features/studio/studio-mappers'
import type { StudioBouquet, StudioGenerationStatus, StudioStep, StudioVersion } from '@/features/studio/types'
import { createStudioSchema, STUDIO_NAME_MAX_LENGTH, type StudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

/**
 * The studio is always opened from a product page, so the design and the stems
 * it is built from both come from `GET /v1/products/{id}`. A product with no
 * materials still designs fine - the stem list is simply empty.
 */
export function useStudioDesigner(detail: ProductDetail) {
  const { t: tRoot } = useTranslation()

  const product = useMemo(() => toStudioProduct(detail), [detail])
  const productIngredients = useMemo(() => toStudioIngredients(detail.materials), [detail.materials])
  const baseIngredientQuantities = useMemo(
    () => Object.fromEntries(productIngredients.map((ingredient) => [ingredient.id, ingredient.baseQuantity])),
    [productIngredients]
  )
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
      ingredientQuantities: { ...baseIngredientQuantities },
      styleId: studioStyles[0].id,
      ribbonId: studioRibbons[0].id,
      wrapId: studioWraps[0].id
    }
  })

  const designName = useWatch({ control, name: 'name' })
  const selectedMockupId = useWatch({ control, name: 'mockupId' })
  const ingredientQuantities = useWatch({ control, name: 'ingredientQuantities' })
  const selectedStyleId = useWatch({ control, name: 'styleId' })
  const selectedRibbonId = useWatch({ control, name: 'ribbonId' })
  const selectedWrapId = useWatch({ control, name: 'wrapId' })

  const mockup = studioMockups.find((item) => item.id === selectedMockupId)
  const trimmedName = designName.trim()
  const nameValid = trimmedName.length >= 2 && designName.length <= STUDIO_NAME_MAX_LENGTH

  const bouquet = useMemo<StudioBouquet>(() => {
    const ingredients = productIngredients.map((ingredient) => {
      const quantity = ingredientQuantities[ingredient.id] ?? ingredient.baseQuantity

      return { ingredient, quantity, extraQuantity: quantity - ingredient.baseQuantity }
    })

    return {
      style: studioStyles.find((item) => item.id === selectedStyleId),
      ribbon: studioRibbons.find((item) => item.id === selectedRibbonId),
      wrap: studioWraps.find((item) => item.id === selectedWrapId),
      products: [product],
      ingredients,
      totalAmount: ingredients.reduce(
        (total, item) => total + item.extraQuantity * (item.ingredient.extraPriceAmount ?? 0),
        product.priceAmount
      )
    }
  }, [ingredientQuantities, productIngredients, product, selectedRibbonId, selectedStyleId, selectedWrapId])

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

  /** The base stems belong to the design itself, so a quantity never drops below them. */
  const adjustIngredient = (id: string, delta: number) => {
    const ingredient = productIngredients.find((item) => item.id === id)
    if (!ingredient) return

    const current = getValues('ingredientQuantities')
    const next = Math.max(ingredient.baseQuantity, (current[id] ?? ingredient.baseQuantity) + delta)
    if (next === current[id]) return

    setValue('ingredientQuantities', { ...current, [id]: next }, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const increaseIngredient = (id: string) => adjustIngredient(id, 1)
  const decreaseIngredient = (id: string) => adjustIngredient(id, -1)

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
  }, [generationStatus, getValues, product.imageUrl])

  return {
    control,
    product,
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
    setStep,
    setAdded,
    goTo,
    goNext,
    goBack,
    markChanged,
    selectMockup,
    increaseIngredient,
    decreaseIngredient,
    selectStyle,
    selectRibbon,
    selectWrap,
    selectVersion,
    startGeneration
  }
}
