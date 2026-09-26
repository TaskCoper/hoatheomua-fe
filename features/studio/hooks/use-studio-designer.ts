'use client'

import { useGetInfiniteProducts } from '@/features/products/hooks/use-get-infinite-products'
import type { ProductFamily, ProductFamilyMember } from '@/features/products/types'
import { useCreateAiFlower } from '@/features/studio/hooks/use-create-ai-flower'
import { useStudioPurchase } from '@/features/studio/hooks/use-studio-purchase'
import {
  roundStudioQuantity,
  STUDIO_COMPOSE_STEP,
  STUDIO_LAST_STEP,
  STUDIO_RIBBON_LABELS,
  STUDIO_SCENE_STEP,
  STUDIO_WRAP_LABELS
} from '@/features/studio/studio-data'
import {
  getStudioTrimsAmount,
  pickGeneratedFlowerImageUrl,
  toStudioAiFlowerOption,
  toStudioIngredients,
  toStudioProduct,
  toStudioProductOptions,
  toStudioReferenceOptions,
  toStudioVariantOptions,
  toStudioVersionMaterials
} from '@/features/studio/studio-mappers'
import type {
  AiFlower,
  CreateAiFlowerPayload,
  StudioBouquet,
  StudioGenerationStatus,
  StudioStep,
  StudioVersion
} from '@/features/studio/types'
import { STUDIO_NAME_MAX_LENGTH } from '@/features/studio/validations'
import { useGetInfiniteReferenceFlowers } from '@/hooks/use-get-infinite-reference-flowers'
import { useRouter } from '@/lib/i18n/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'

export function useStudioDesigner(family: ProductFamily) {
  const router = useRouter()

  const detail = family.parent
  const variants = useMemo(
    () => (family.children ?? []).filter((child): child is ProductFamilyMember => Boolean(child?.id)),
    [family.children]
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

  const [step, setStep] = useState<StudioStep>(1)
  const [maxStep, setMaxStep] = useState<StudioStep>(1)
  const [generated, setGenerated] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [versions, setVersions] = useState<StudioVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState('')

  const needsComposeOptions = maxStep >= STUDIO_COMPOSE_STEP
  const needsSceneOptions = maxStep >= STUDIO_SCENE_STEP

  const {
    referenceFlowers: bundles,
    isGettingReferenceFlowers: isGettingBundles,
    isGettingMoreReferenceFlowers: isGettingMoreBundles,
    hasMoreReferenceFlowers: hasMoreBundles,
    loadMoreReferenceFlowers: loadMoreBundles
  } = useGetInfiniteReferenceFlowers({ type: 'bundle', enabled: needsComposeOptions })
  const {
    referenceFlowers: sceneFlowers,
    isGettingReferenceFlowers: isGettingScenes,
    isGettingMoreReferenceFlowers: isGettingMoreScenes,
    hasMoreReferenceFlowers: hasMoreScenes,
    loadMoreReferenceFlowers: loadMoreScenes
  } = useGetInfiniteReferenceFlowers({ type: 'flower', enabled: needsSceneOptions })
  const {
    products: ribbonProducts,
    isGettingProducts: isGettingRibbons,
    isGettingMoreProducts: isGettingMoreRibbons,
    hasMoreProducts: hasMoreRibbons,
    loadMoreProducts: loadMoreRibbons
  } = useGetInfiniteProducts({ labels: STUDIO_RIBBON_LABELS, enabled: needsComposeOptions })
  const {
    products: wrapProducts,
    isGettingProducts: isGettingWraps,
    isGettingMoreProducts: isGettingMoreWraps,
    hasMoreProducts: hasMoreWraps,
    loadMoreProducts: loadMoreWraps
  } = useGetInfiniteProducts({ labels: STUDIO_WRAP_LABELS, enabled: needsComposeOptions })

  const styleOptions = useMemo(() => toStudioReferenceOptions(bundles), [bundles])
  const sceneOptions = useMemo(() => toStudioReferenceOptions(sceneFlowers), [sceneFlowers])
  const ribbonOptions = useMemo(() => toStudioProductOptions(ribbonProducts), [ribbonProducts])
  const wrapOptions = useMemo(() => toStudioProductOptions(wrapProducts), [wrapProducts])

  const versionCount = useRef(0)

  const onCreated = (flower: AiFlower, body: CreateAiFlowerPayload) => {
    const scene = sceneOptions.find((item) => item.id === body.mockupId)
    const variantImage = variants.find((item) => item.id === body.productId)?.coverImage
    const ribbonPrice = ribbonOptions.find((item) => item.id === body.ribbonProductId)?.priceAmount ?? null
    const wrapPrice = wrapOptions.find((item) => item.id === body.wrappingPaperProductId)?.priceAmount ?? null
    versionCount.current += 1

    const version: StudioVersion = {
      id: flower.id,
      label: versionCount.current,
      name: flower.name,
      productId: body.productId,
      mockupId: body.mockupId,
      mockupName: scene?.name ?? '',
      imageUrl: pickGeneratedFlowerImageUrl(flower) ?? scene?.imageUrl ?? variantImage ?? detail.coverImage,
      createdAt: flower.createdAt,
      materials: toStudioVersionMaterials(flower.metadata),
      style: styleOptions.find((item) => item.id === body.bundleId) ?? null,
      ribbon: toStudioAiFlowerOption(flower.metadata.ribbon, ribbonPrice),
      wrap: toStudioAiFlowerOption(flower.metadata.wrappingPaper, wrapPrice)
    }

    setVersions((current) => [...current, version])
    setActiveVersionId(version.id)
    setSessionId(flower.sessionId)
    setGenerated(true)
    setStep(STUDIO_LAST_STEP)
    setMaxStep(STUDIO_LAST_STEP)

    if (flower.sessionId) router.push(`/products/${detail.id}/studio/${flower.sessionId}`)
  }

  const {
    methods: { control, setValue, getValues },
    generate: startGeneration,
    generationStage,
    isCreatingAiFlower
  } = useCreateAiFlower({
    defaultValues: {
      name: '',
      mockupId: '',
      productId: defaultDetail.id,
      ingredientQuantities: { ...defaultQuantities },
      styleId: '',
      ribbonId: '',
      wrapId: ''
    },
    onCreated
  })

  const generationStatus: StudioGenerationStatus = isCreatingAiFlower ? 'generating' : generated ? 'complete' : 'idle'

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

  const parentProduct = useMemo(() => toStudioProduct(detail), [detail])
  const parentIngredients = useMemo(() => toStudioIngredients(detail.materials), [detail.materials])

  const mockup = sceneOptions.find((item) => item.id === selectedMockupId)
  const trimmedName = designName.trim()
  const nameValid = trimmedName.length >= 2 && designName.length <= STUDIO_NAME_MAX_LENGTH

  const bouquet = useMemo<StudioBouquet>(() => {
    const ingredients = productIngredients.map((ingredient) => {
      const quantity = ingredientQuantities[ingredient.id] ?? ingredient.baseQuantity

      return { ingredient, quantity, extraQuantity: roundStudioQuantity(quantity - ingredient.baseQuantity) }
    })

    const ribbon = ribbonOptions.find((item) => item.id === selectedRibbonId)
    const wrap = wrapOptions.find((item) => item.id === selectedWrapId)

    return {
      style: styleOptions.find((item) => item.id === selectedStyleId),
      ribbon,
      wrap,
      products: [product],
      ingredients,
      totalAmount: ingredients.reduce(
        (total, item) => total + item.extraQuantity * (item.ingredient.extraPriceAmount ?? 0),
        product.priceAmount + getStudioTrimsAmount(ribbon, wrap)
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

  const activeVersion = versions.find((item) => item.id === activeVersionId)

  const { added, addToBag, buyNow, canBuyNow, isPhoneMissing, isAddToBagDisabled, isBuyNowDisabled, resetAdded } =
    useStudioPurchase({
      productId: activeVersion?.productId ?? product.id,
      productName: product.name,
      designName: trimmedName,
      rootProductId: detail.id,
      sessionId,
      flowerId: activeVersionId,
      unitPrice: bouquet.totalAmount,
      ribbon: activeVersion?.ribbon ?? bouquet.ribbon ?? null,
      wrap: activeVersion?.wrap ?? bouquet.wrap ?? null
    })

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
    setGenerated(false)
    setActiveVersionId('')
    resetAdded()
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

  const selectVersion = (version: StudioVersion) => {
    setActiveVersionId(version.id)
    setValue('name', version.name, { shouldValidate: true })
    setValue('mockupId', version.mockupId, { shouldValidate: true })
    setSaved(false)
    resetAdded()
    setGenerated(true)
    setStep(STUDIO_LAST_STEP)
    setMaxStep(STUDIO_LAST_STEP)
  }

  return {
    control,
    product,
    parentProduct,
    parentIngredients,
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
    addToBag,
    buyNow,
    canBuyNow,
    isPhoneMissing,
    isAddToBagDisabled,
    isBuyNowDisabled,
    setStep,
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
