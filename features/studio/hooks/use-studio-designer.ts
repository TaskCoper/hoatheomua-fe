'use client'

import { useGetInfiniteProducts } from '@/features/products/hooks/use-get-infinite-products'
import type { ProductDetail } from '@/features/products/types'
import {
  roundStudioQuantity,
  STUDIO_LAST_STEP,
  STUDIO_RIBBON_LABELS,
  STUDIO_WRAP_LABELS
} from '@/features/studio/studio-data'
import {
  toStudioIngredients,
  toStudioProduct,
  toStudioProductOptions,
  toStudioReferenceOptions,
  toStudioVariantOptions
} from '@/features/studio/studio-mappers'
import type { StudioBouquet, StudioGenerationStatus, StudioStep, StudioVersion } from '@/features/studio/types'
import { createStudioSchema, STUDIO_NAME_MAX_LENGTH, type StudioFormValues } from '@/features/studio/validations'
import { useGetInfiniteReferenceFlowers } from '@/hooks/use-get-infinite-reference-flowers'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

export function useStudioDesigner(detail: ProductDetail) {
  const { t: tRoot } = useTranslation()

  const variants = useMemo(
    () => (detail.children ?? []).filter((child): child is ProductDetail => Boolean(child?.id)),
    [detail.children]
  )
  const variantOptions = useMemo(() => toStudioVariantOptions(variants), [variants])
  const defaultDetail = variants[0] ?? detail
  const defaultQuantities = useMemo(
    () =>
      Object.fromEntries(
        toStudioIngredients(defaultDetail.materials).map((ingredient) => [ingredient.id, ingredient.baseQuantity])
      ),
    [defaultDetail]
  )

  const {
    referenceFlowers: bundles,
    isGettingReferenceFlowers: isGettingBundles,
    isGettingMoreReferenceFlowers: isGettingMoreBundles,
    hasMoreReferenceFlowers: hasMoreBundles,
    loadMoreReferenceFlowers: loadMoreBundles
  } = useGetInfiniteReferenceFlowers({ type: 'bundle' })
  const {
    referenceFlowers: sceneFlowers,
    isGettingReferenceFlowers: isGettingScenes,
    isGettingMoreReferenceFlowers: isGettingMoreScenes,
    hasMoreReferenceFlowers: hasMoreScenes,
    loadMoreReferenceFlowers: loadMoreScenes
  } = useGetInfiniteReferenceFlowers({ type: 'flower' })
  const {
    products: ribbonProducts,
    isGettingProducts: isGettingRibbons,
    isGettingMoreProducts: isGettingMoreRibbons,
    hasMoreProducts: hasMoreRibbons,
    loadMoreProducts: loadMoreRibbons
  } = useGetInfiniteProducts({ labels: STUDIO_RIBBON_LABELS })
  const {
    products: wrapProducts,
    isGettingProducts: isGettingWraps,
    isGettingMoreProducts: isGettingMoreWraps,
    hasMoreProducts: hasMoreWraps,
    loadMoreProducts: loadMoreWraps
  } = useGetInfiniteProducts({ labels: STUDIO_WRAP_LABELS })

  const styleOptions = useMemo(() => toStudioReferenceOptions(bundles), [bundles])
  const sceneOptions = useMemo(() => toStudioReferenceOptions(sceneFlowers), [sceneFlowers])
  const ribbonOptions = useMemo(() => toStudioProductOptions(ribbonProducts), [ribbonProducts])
  const wrapOptions = useMemo(() => toStudioProductOptions(wrapProducts), [wrapProducts])

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
      productId: defaultDetail.id,
      ingredientQuantities: { ...defaultQuantities },
      styleId: '',
      ribbonId: '',
      wrapId: ''
    }
  })

  const designName = useWatch({ control, name: 'name' })
  const selectedProductId = useWatch({ control, name: 'productId' })
  const selectedMockupId = useWatch({ control, name: 'mockupId' })
  const ingredientQuantities = useWatch({ control, name: 'ingredientQuantities' })
  const selectedStyleId = useWatch({ control, name: 'styleId' })
  const selectedRibbonId = useWatch({ control, name: 'ribbonId' })
  const selectedWrapId = useWatch({ control, name: 'wrapId' })

  const selectedDetail = useMemo(
    () => variants.find((variant) => variant.id === selectedProductId) ?? detail,
    [detail, selectedProductId, variants]
  )
  const product = useMemo(() => toStudioProduct(selectedDetail, detail), [detail, selectedDetail])
  const productIngredients = useMemo(() => toStudioIngredients(selectedDetail.materials), [selectedDetail.materials])

  const mockup = sceneOptions.find((item) => item.id === selectedMockupId)
  const trimmedName = designName.trim()
  const nameValid = trimmedName.length >= 2 && designName.length <= STUDIO_NAME_MAX_LENGTH

  const bouquet = useMemo<StudioBouquet>(() => {
    const ingredients = productIngredients.map((ingredient) => {
      const quantity = ingredientQuantities[ingredient.id] ?? ingredient.baseQuantity

      return { ingredient, quantity, extraQuantity: roundStudioQuantity(quantity - ingredient.baseQuantity) }
    })

    return {
      style: styleOptions.find((item) => item.id === selectedStyleId),
      ribbon: ribbonOptions.find((item) => item.id === selectedRibbonId),
      wrap: wrapOptions.find((item) => item.id === selectedWrapId),
      products: [product],
      ingredients,
      totalAmount: ingredients.reduce(
        (total, item) => total + item.extraQuantity * (item.ingredient.extraPriceAmount ?? 0),
        product.priceAmount
      )
    }
  }, [
    ingredientQuantities,
    productIngredients,
    product,
    ribbonOptions,
    selectedRibbonId,
    selectedStyleId,
    selectedWrapId,
    styleOptions,
    wrapOptions
  ])

  useEffect(() => {
    const pickers = [
      ['styleId', styleOptions],
      ['ribbonId', ribbonOptions],
      ['wrapId', wrapOptions]
    ] as const

    pickers.forEach(([field, options]) => {
      if (options.length === 0) return

      const current = getValues(field)
      if (current && options.some((option) => option.id === current)) return

      setValue(field, options[0].id, { shouldValidate: true })
    })
  }, [getValues, ribbonOptions, setValue, styleOptions, wrapOptions])

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

  const adjustIngredient = (id: string, direction: number) => {
    const ingredient = productIngredients.find((item) => item.id === id)
    if (!ingredient) return

    const current = getValues('ingredientQuantities')
    const quantity = current[id] ?? ingredient.baseQuantity
    const next = Math.max(ingredient.baseQuantity, roundStudioQuantity(quantity + direction * ingredient.step))
    if (next === current[id]) return

    setValue('ingredientQuantities', { ...current, [id]: next }, { shouldDirty: true, shouldValidate: true })
    markChanged()
  }

  const increaseIngredient = (id: string) => adjustIngredient(id, 1)
  const decreaseIngredient = (id: string) => adjustIngredient(id, -1)

  const selectVariant = (id: string) => {
    if (id === selectedProductId) return

    const variant = variants.find((item) => item.id === id)
    if (!variant) return

    const ingredients = toStudioIngredients(variant.materials)
    setValue('productId', id, { shouldDirty: true, shouldValidate: true })
    setValue(
      'ingredientQuantities',
      Object.fromEntries(ingredients.map((ingredient) => [ingredient.id, ingredient.baseQuantity])),
      { shouldDirty: true, shouldValidate: true }
    )
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
      const scene = sceneOptions.find((item) => item.id === values.mockupId)
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
  }, [generationStatus, getValues, product.imageUrl, sceneOptions])

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
    variantOptions,
    selectedProductId,
    styleOptions,
    ribbonOptions,
    wrapOptions,
    sceneOptions,
    isGettingStyleOptions: isGettingBundles,
    isGettingRibbonOptions: isGettingRibbons,
    isGettingWrapOptions: isGettingWraps,
    isGettingSceneOptions: isGettingScenes,
    isGettingMoreStyleOptions: isGettingMoreBundles,
    isGettingMoreRibbonOptions: isGettingMoreRibbons,
    isGettingMoreWrapOptions: isGettingMoreWraps,
    isGettingMoreSceneOptions: isGettingMoreScenes,
    hasMoreStyleOptions: hasMoreBundles,
    hasMoreRibbonOptions: hasMoreRibbons,
    hasMoreWrapOptions: hasMoreWraps,
    hasMoreSceneOptions: hasMoreScenes,
    loadMoreStyleOptions: loadMoreBundles,
    loadMoreRibbonOptions: loadMoreRibbons,
    loadMoreWrapOptions: loadMoreWraps,
    loadMoreSceneOptions: loadMoreScenes,
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
    selectVariant,
    increaseIngredient,
    decreaseIngredient,
    selectStyle,
    selectRibbon,
    selectWrap,
    selectVersion,
    startGeneration
  }
}
