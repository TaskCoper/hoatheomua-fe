import type { ProductDetail, ProductFamilyMember, ProductMaterial } from '@/features/products/types'
import {
  roundStudioQuantity,
  STUDIO_DECIMAL_QUANTITY_STEP,
  STUDIO_SESSION_FINISHED_COUNT,
  STUDIO_WHOLE_QUANTITY_STEP
} from '@/features/studio/studio-data'
import type {
  AiFlowerMaterial,
  AiFlowerMetadata,
  AiFlowerProductRef,
  CreateAiFlowerPayload,
  GeneratedFlower,
  GeneratedFlowerImageStages,
  GeneratedFlowerRef,
  GeneratedFlowerSession,
  StudioBouquet,
  StudioGenerationSession,
  StudioIngredient,
  StudioOption,
  StudioProduct,
  StudioScene,
  StudioTrim,
  StudioVariant,
  StudioVersion,
  StudioVersionMaterial
} from '@/features/studio/types'
import type { StudioFormValues } from '@/features/studio/validations'
import type { ReferenceFlower } from '@/services/reference-flower.service'

export const toStudioProduct = (product: ProductFamilyMember, parent?: ProductFamilyMember): StudioProduct => ({
  id: product.id,
  name: product.productName?.trim() || parent?.productName?.trim() || '',
  note: product.description?.trim() || parent?.description?.trim() || null,
  priceAmount: product.price ?? parent?.price ?? 0,
  imageUrl: product.coverImage ?? parent?.coverImage ?? null,
  imageFit: 'cover'
})

export const toStudioIngredients = (materials: ProductMaterial[] | null | undefined): StudioIngredient[] =>
  (materials ?? []).flatMap((material) => {
    const name = material.productName?.trim()
    if (!name) return []

    const baseQuantity = Math.max(0, material.quantity)

    return [
      {
        id: material.id,
        name,
        imageUrl: material.coverImage,
        baseQuantity,
        step: Number.isInteger(baseQuantity) ? STUDIO_WHOLE_QUANTITY_STEP : STUDIO_DECIMAL_QUANTITY_STEP,
        extraPriceAmount: material.price > 0 ? material.price : null
      }
    ]
  })

const toStudioOption = (
  id: string,
  name: string | null,
  description: string | null,
  imageUrl: string | null
): StudioOption[] => {
  const trimmed = name?.trim()

  return trimmed ? [{ id, name: trimmed, description: description?.trim() || null, imageUrl }] : []
}

export const toStudioProductOptions = (products: ProductDetail[] | null | undefined): StudioTrim[] =>
  (products ?? []).flatMap((product) =>
    toStudioOption(product.id, product.productName, product.description, product.coverImage).map((option) => ({
      ...option,
      priceAmount: product.price ?? null
    }))
  )

export const toStudioReferenceOptions = (flowers: ReferenceFlower[] | null | undefined): StudioOption[] =>
  (flowers ?? []).flatMap((flower) => toStudioOption(flower.id, flower.name, flower.description, flower.imageUrl))

export const toStudioVariantOptions = (variants: ProductFamilyMember[]): StudioVariant[] =>
  variants.map((variant) => ({
    id: variant.id,
    name: variant.productName?.trim() || variant.id,
    description: variant.description?.trim() || null,
    imageUrl: variant.coverImage,
    priceAmount: variant.price
  }))

export const toCreateAiFlowerPayload = (values: StudioFormValues): CreateAiFlowerPayload => ({
  name: values.name.trim(),
  productId: values.productId,
  materialTotals: Object.entries(values.ingredientQuantities).map(([matId, quantity]) => ({ matId, quantity })),
  bundleId: values.styleId,
  mockupId: values.mockupId,
  ribbonProductId: values.ribbonId,
  wrappingPaperProductId: values.wrapId
})

export const toStudioAiFlowerOption = (
  product: AiFlowerProductRef | null,
  priceAmount: number | null = null
): StudioTrim | null => {
  const name = product?.name?.trim()
  if (!product || !name) return null

  const { size, color, productCode } = product.attributes
  const traits = [size, color].filter((part): part is string => Boolean(part?.trim())).join(' · ')

  return {
    id: product.id,
    name,
    description: traits || productCode?.trim() || null,
    imageUrl: product.image.url,
    priceAmount
  }
}

export const toStudioVersionMaterials = (metadata: AiFlowerMetadata | null | undefined): StudioVersionMaterial[] => {
  const base = metadata?.materials ?? []
  const additions = metadata?.AdditionCustome ?? []

  const toMaterial = (material: AiFlowerMaterial, baseQuantity: number, extraQuantity: number) => ({
    matId: material.matId,
    name: material.name?.trim() || '',
    isCore: material.isCore,
    imageUrl: material.coverImage,
    baseQuantity,
    extraQuantity,
    quantity: roundStudioQuantity(baseQuantity + extraQuantity)
  })

  const extras = new Map(additions.map((addition) => [addition.matId, Math.max(0, addition.quantity)]))

  return [
    ...base.map((material) => toMaterial(material, Math.max(0, material.quantity), extras.get(material.matId) ?? 0)),
    ...additions
      .filter((addition) => !base.some((material) => material.matId === addition.matId))
      .map((addition) => toMaterial(addition, 0, Math.max(0, addition.quantity)))
  ]
}

export const pickGeneratedFlowerImageUrl = <TImageUrl extends string | null>(
  flower: GeneratedFlowerImageStages & { imageUrl: TImageUrl }
): string | TImageUrl =>
  flower.flowerWithLogoImageUrl ?? flower.flowerWithMockupImageUrl ?? flower.flowerImageUrl ?? flower.imageUrl

const toGeneratedFlowerOption = (ref: GeneratedFlowerRef | null | undefined): StudioOption | null => {
  const name = ref?.name?.trim()

  return ref && name ? { id: ref.id, name, description: null, imageUrl: ref.imageUrl } : null
}

const toGeneratedFlowerTrim = (
  ref: GeneratedFlowerRef | null | undefined,
  priceAmount: number | null = null
): StudioTrim | null => {
  const option = toGeneratedFlowerOption(ref)

  return option ? { ...option, priceAmount } : null
}

export const toStudioSessionScene = (ref: GeneratedFlowerRef | null | undefined): StudioScene | undefined =>
  toGeneratedFlowerOption(ref) ?? undefined

export const toStudioSessionVersions = (flowers: GeneratedFlower[] | null | undefined): StudioVersion[] =>
  [...(flowers ?? [])]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((flower, index) => ({
      id: flower.id,
      label: index + 1,
      name: flower.name?.trim() || '',
      productId: flower.productId,
      mockupId: flower.mockup?.id ?? '',
      mockupName: flower.mockup?.name?.trim() ?? '',
      imageUrl: pickGeneratedFlowerImageUrl(flower),
      createdAt: flower.createdAt,
      materials: toStudioVersionMaterials(flower.metadata),
      style: toGeneratedFlowerOption(flower.bundle),
      ribbon: toStudioAiFlowerOption(flower.metadata?.ribbon ?? null) ?? toGeneratedFlowerTrim(flower.ribbon),
      wrap:
        toStudioAiFlowerOption(flower.metadata?.wrappingPaper ?? null) ?? toGeneratedFlowerTrim(flower.wrappingPaper)
    }))

export const toStudioGenerationSessions = (
  sessions: GeneratedFlowerSession[] | null | undefined
): StudioGenerationSession[] =>
  (sessions ?? []).flatMap((session) => {
    const flowers = [...session.flowers].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const latest = flowers[flowers.length - 1]
    if (!latest) return []

    const coverImageUrl =
      [...flowers]
        .reverse()
        .map((flower) => pickGeneratedFlowerImageUrl(flower))
        .find(Boolean) ?? null

    return [
      {
        sessionId: session.sessionId,
        productId: latest.rootProductId || latest.productId,
        name: latest.name?.trim() || latest.product?.name?.trim() || '',
        mockupId: latest.mockup?.id ?? '',
        mockupName: latest.mockup?.name?.trim() ?? '',
        imageUrl: coverImageUrl,
        createdAt: session.latestCreatedAt || latest.createdAt,
        versionCount: flowers.length,
        isFinished: flowers.length > STUDIO_SESSION_FINISHED_COUNT
      }
    ]
  })

export const getStudioTrimsAmount = (...trims: (StudioTrim | null | undefined)[]): number =>
  trims.reduce((total, trim) => total + (trim?.priceAmount ?? 0), 0)

const priceStudioTrim = (
  trim: StudioTrim | null | undefined,
  priceByProductId: ReadonlyMap<string, number | null>
): StudioTrim | undefined =>
  trim ? { ...trim, priceAmount: trim.priceAmount ?? priceByProductId.get(trim.id) ?? null } : undefined

const NO_TRIM_PRICES: ReadonlyMap<string, number | null> = new Map()

export const toStudioSessionBouquet = ({
  version,
  product,
  ingredients,
  trimPriceByProductId = NO_TRIM_PRICES
}: {
  version: StudioVersion | undefined
  product: StudioProduct
  ingredients: StudioIngredient[]
  trimPriceByProductId?: ReadonlyMap<string, number | null>
}): StudioBouquet => {
  const items = version?.materials.length
    ? version.materials.map((material) => {
        const ingredient = ingredients.find((item) => item.id === material.matId) ?? {
          id: material.matId,
          name: material.name,
          imageUrl: material.imageUrl,
          baseQuantity: material.baseQuantity,
          step: Number.isInteger(material.quantity) ? STUDIO_WHOLE_QUANTITY_STEP : STUDIO_DECIMAL_QUANTITY_STEP,
          extraPriceAmount: null
        }

        return { ingredient, quantity: material.quantity, extraQuantity: material.extraQuantity }
      })
    : ingredients.map((ingredient) => ({ ingredient, quantity: ingredient.baseQuantity, extraQuantity: 0 }))

  const ribbon = priceStudioTrim(version?.ribbon, trimPriceByProductId)
  const wrap = priceStudioTrim(version?.wrap, trimPriceByProductId)

  return {
    style: version?.style ?? undefined,
    ribbon,
    wrap,
    products: [product],
    ingredients: items,
    totalAmount: items.reduce(
      (total, item) => total + item.extraQuantity * (item.ingredient.extraPriceAmount ?? 0),
      product.priceAmount + getStudioTrimsAmount(ribbon, wrap)
    )
  }
}
