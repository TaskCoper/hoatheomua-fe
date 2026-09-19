import type { ProductDetail, ProductMaterial } from '@/features/products/types'
import type { StudioIngredient, StudioProduct } from '@/features/studio/types'

const BASE_QUANTITY = 0

export const toStudioProduct = (product: ProductDetail): StudioProduct => ({
  id: product.id,
  name: product.productName?.trim() || '',
  note: product.description?.trim() || null,
  priceAmount: product.price ?? 0,
  imageUrl: product.coverImage,
  imageFit: 'cover'
})

export const toStudioIngredients = (materials: ProductMaterial[] | null | undefined): StudioIngredient[] =>
  (materials ?? []).flatMap((material) => {
    const name = material.productName?.trim()
    if (!name) return []

    return [
      {
        id: material.id,
        name,
        imageUrl: material.coverImage,
        baseQuantity: BASE_QUANTITY,
        extraPriceAmount: null
      }
    ]
  })
