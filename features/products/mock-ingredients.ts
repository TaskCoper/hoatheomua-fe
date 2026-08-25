import type { BouquetIngredient } from '@/features/products/bouquet-composition'

const MATERIAL_IMAGE_POOL = [
  '/images/custom/material-1.png',
  '/images/custom/material-2.png',
  '/images/custom/material-3.png',
  '/images/custom/material-4.png',
  '/images/custom/material-5.png'
]

export const MOCK_AI_PREVIEW = '/images/custom/custom-flower.png'

const MIN_INGREDIENTS = 3
const MAX_INGREDIENTS = MATERIAL_IMAGE_POOL.length

function hashId(value: string): number {
  let hash = 2166136261

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function getMockIngredients(productId: string): BouquetIngredient[] {
  const seed = hashId(productId)
  const count = MIN_INGREDIENTS + (seed % (MAX_INGREDIENTS - MIN_INGREDIENTS + 1))

  // Draw without replacement so one bouquet never shows the same material twice.
  const remaining = [...MATERIAL_IMAGE_POOL]
  let cursor = seed

  return Array.from({ length: count }, (_, index) => {
    cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0
    return {
      id: `${productId}-ingredient-${index}`,
      image: remaining.splice(cursor % remaining.length, 1)[0]
    }
  })
}
