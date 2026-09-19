import type { ProductDetail, ProductMaterial } from '@/features/products/types'
import { STUDIO_DECIMAL_QUANTITY_STEP, STUDIO_WHOLE_QUANTITY_STEP } from '@/features/studio/studio-data'
import type { StudioIngredient, StudioOption, StudioProduct, StudioVariant } from '@/features/studio/types'
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

export const toStudioBundleOptions = (bundles: ReferenceFlower[] | null | undefined): StudioOption[] =>
  (bundles ?? []).flatMap((bundle) => toStudioOption(bundle.id, bundle.name, bundle.description, bundle.imageUrl))

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
