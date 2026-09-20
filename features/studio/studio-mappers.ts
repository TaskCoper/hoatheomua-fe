import type { ProductDetail, ProductMaterial } from '@/features/products/types'
import {
  roundStudioQuantity,
  STUDIO_DECIMAL_QUANTITY_STEP,
  STUDIO_SESSION_FINISHED_COUNT,
  STUDIO_WHOLE_QUANTITY_STEP
} from '@/features/studio/studio-data'
import type {
  AiFlowerProductRef,
  CreateAiFlowerPayload,
  GeneratedFlower,
  GeneratedFlowerRef,
  GeneratedFlowerSession,
  StudioBouquet,
  StudioGenerationSession,
  StudioIngredient,
  StudioOption,
  StudioProduct,
  StudioScene,
  StudioVariant,
  StudioVersion
} from '@/features/studio/types'
import type { StudioFormValues } from '@/features/studio/validations'
import type { ReferenceFlower } from '@/services/reference-flower.service'

export const toStudioProduct = (product: ProductDetail, parent?: ProductDetail): StudioProduct => ({
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

export const toStudioProductOptions = (products: ProductDetail[] | null | undefined): StudioOption[] =>
  (products ?? []).flatMap((product) =>
    toStudioOption(product.id, product.productName, product.description, product.coverImage)
  )

export const toStudioReferenceOptions = (flowers: ReferenceFlower[] | null | undefined): StudioOption[] =>
  (flowers ?? []).flatMap((flower) => toStudioOption(flower.id, flower.name, flower.description, flower.imageUrl))

export const toStudioVariantOptions = (variants: ProductDetail[]): StudioVariant[] =>
  variants.map((variant) => {
    const name = variant.productName?.trim()
    const traits = [variant.size, variant.color].filter((part): part is string => Boolean(part?.trim())).join(' · ')

    return {
      id: variant.id,
      name: name || traits || variant.productCode?.trim() || variant.id,
      description: variant.description?.trim() || null,
      imageUrl: variant.coverImage,
      priceAmount: variant.price
    }
  })

export const toCreateAiFlowerPayload = (values: StudioFormValues): CreateAiFlowerPayload => ({
  name: values.name.trim(),
  productId: values.productId,
  materialTotals: Object.entries(values.ingredientQuantities).map(([matId, quantity]) => ({ matId, quantity })),
  bundleId: values.styleId,
  mockupId: values.mockupId,
  ribbonProductId: values.ribbonId,
  wrappingPaperProductId: values.wrapId
})

export const toStudioAiFlowerOption = (product: AiFlowerProductRef | null): StudioOption | null => {
  const name = product?.name?.trim()
  if (!product || !name) return null

  const { size, color, productCode } = product.attributes
  const traits = [size, color].filter((part): part is string => Boolean(part?.trim())).join(' · ')

  return { id: product.id, name, description: traits || productCode?.trim() || null, imageUrl: product.image.url }
}

const toGeneratedFlowerOption = (ref: GeneratedFlowerRef | null | undefined): StudioOption | null => {
  const name = ref?.name?.trim()

  return ref && name ? { id: ref.id, name, description: null, imageUrl: ref.imageUrl } : null
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
      imageUrl: flower.imageUrl,
      createdAt: flower.createdAt,
      materials: flower.metadata?.materials ?? [],
      style: toGeneratedFlowerOption(flower.bundle),
      // The metadata copy carries the size / colour traits, so it wins over the flat reference.
      ribbon: toStudioAiFlowerOption(flower.metadata?.ribbon ?? null) ?? toGeneratedFlowerOption(flower.ribbon),
      wrap:
        toStudioAiFlowerOption(flower.metadata?.wrappingPaper ?? null) ?? toGeneratedFlowerOption(flower.wrappingPaper)
    }))

export const toStudioGenerationSessions = (
  sessions: GeneratedFlowerSession[] | null | undefined
): StudioGenerationSession[] =>
  (sessions ?? []).flatMap((session) => {
    const flowers = [...session.flowers].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const latest = flowers[flowers.length - 1]
    if (!latest) return []

    const cover = [...flowers].reverse().find((flower) => flower.imageUrl) ?? latest

    return [
      {
        sessionId: session.sessionId,
        productId: latest.rootProductId || latest.productId,
        name: latest.name?.trim() || latest.product?.name?.trim() || '',
        mockupId: latest.mockup?.id ?? '',
        mockupName: latest.mockup?.name?.trim() ?? '',
        imageUrl: cover.imageUrl,
        createdAt: session.latestCreatedAt || latest.createdAt,
        versionCount: flowers.length,
        isFinished: flowers.length > STUDIO_SESSION_FINISHED_COUNT
      }
    ]
  })

export const toStudioSessionBouquet = ({
  version,
  product,
  ingredients
}: {
  version: StudioVersion | undefined
  product: StudioProduct
  ingredients: StudioIngredient[]
}): StudioBouquet => {
  const items = version?.materials.length
    ? version.materials.map((material) => {
        const quantity = Math.max(0, material.quantity)
        const ingredient = ingredients.find((item) => item.id === material.matId) ?? {
          id: material.matId,
          name: material.name?.trim() || '',
          imageUrl: null,
          baseQuantity: quantity,
          step: Number.isInteger(quantity) ? STUDIO_WHOLE_QUANTITY_STEP : STUDIO_DECIMAL_QUANTITY_STEP,
          extraPriceAmount: null
        }

        return {
          ingredient,
          quantity,
          extraQuantity: Math.max(0, roundStudioQuantity(quantity - ingredient.baseQuantity))
        }
      })
    : ingredients.map((ingredient) => ({ ingredient, quantity: ingredient.baseQuantity, extraQuantity: 0 }))

  return {
    style: version?.style ?? undefined,
    ribbon: version?.ribbon ?? undefined,
    wrap: version?.wrap ?? undefined,
    products: [product],
    ingredients: items,
    totalAmount: items.reduce(
      (total, item) => total + item.extraQuantity * (item.ingredient.extraPriceAmount ?? 0),
      product.priceAmount
    )
  }
}
