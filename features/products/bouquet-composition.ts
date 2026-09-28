export interface BouquetPlacement {
  /** Center position as a percentage of the square stage. */
  top: string
  left: string
  width: string
  scale: number
  rotation: number
  zIndex: number
  /** Ranges from 0 at the edges to 1 at the bouquet's center. */
  depth: number
  blob: string
}

export interface BouquetIngredient {
  id: string
  label?: string
  image?: string | null
  placement?: Partial<BouquetPlacement>
}

export interface PlacedIngredient {
  ingredient: BouquetIngredient
  placement: BouquetPlacement
}

// Heart-first ordering keeps shorter prefixes visually balanced; z-index controls depth.
export const BOUQUET_SLOTS: BouquetPlacement[] = [
  {
    top: '44%',
    left: '50%',
    width: '38%',
    scale: 1,
    rotation: -5,
    zIndex: 6,
    depth: 1,
    blob: '46% 54% 52% 48% / 50% 44% 56% 50%'
  },
  {
    top: '54%',
    left: '26%',
    width: '32%',
    scale: 0.92,
    rotation: -18,
    zIndex: 4,
    depth: 0.75,
    blob: '58% 42% 47% 53% / 44% 56% 44% 56%'
  },
  {
    top: '50%',
    left: '75%',
    width: '33%',
    scale: 0.95,
    rotation: 15,
    zIndex: 5,
    depth: 0.8,
    blob: '50% 50% 44% 56% / 56% 48% 52% 44%'
  },
  {
    top: '70%',
    left: '44%',
    width: '30%',
    scale: 0.86,
    rotation: 7,
    zIndex: 7,
    depth: 0.9,
    blob: '42% 58% 55% 45% / 52% 42% 58% 48%'
  },
  {
    top: '28%',
    left: '35%',
    width: '26%',
    scale: 0.74,
    rotation: -26,
    zIndex: 3,
    depth: 0.5,
    blob: '54% 46% 43% 57% / 47% 57% 43% 53%'
  },
  {
    top: '26%',
    left: '64%',
    width: '25%',
    scale: 0.72,
    rotation: 22,
    zIndex: 2,
    depth: 0.45,
    blob: '45% 55% 57% 43% / 55% 45% 55% 45%'
  },
  {
    top: '68%',
    left: '70%',
    width: '27%',
    scale: 0.78,
    rotation: 30,
    zIndex: 8,
    depth: 0.6,
    blob: '57% 43% 48% 52% / 43% 54% 46% 57%'
  },
  {
    top: '64%',
    left: '17%',
    width: '22%',
    scale: 0.68,
    rotation: -34,
    zIndex: 1,
    depth: 0.35,
    blob: '48% 52% 56% 44% / 54% 46% 54% 46%'
  },
  {
    top: '34%',
    left: '85%',
    width: '20%',
    scale: 0.64,
    rotation: 34,
    zIndex: 1,
    depth: 0.3,
    blob: '52% 48% 45% 55% / 46% 55% 45% 54%'
  }
]

export const MAX_COMPOSED_INGREDIENTS = BOUQUET_SLOTS.length

// Motion percentages are relative to the tile, so convert the stage-center delta by its width.
export function getGatherOffset(placement: BouquetPlacement): { x: number; y: number } {
  const width = Number.parseFloat(placement.width)

  return {
    x: ((50 - Number.parseFloat(placement.left)) / width) * 100,
    y: ((50 - Number.parseFloat(placement.top)) / width) * 100
  }
}

// Extras are omitted from the composition but remain available to callers for counts.
export function buildBouquetComposition(ingredients: BouquetIngredient[]): PlacedIngredient[] {
  return ingredients.slice(0, MAX_COMPOSED_INGREDIENTS).map((ingredient, index) => ({
    ingredient,
    placement: { ...BOUQUET_SLOTS[index], ...ingredient.placement }
  }))
}
