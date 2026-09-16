export type StudioStep = 1 | 2 | 3 | 4 | 5

export type StudioGenerationStatus = 'idle' | 'generating' | 'complete'

export interface StudioIngredient {
  id: string
  imageUrl: string
  /** How many of this stem the design already carries - the floor the counter starts at. */
  baseQuantity: number
  /** What one stem beyond the base adds to the total. */
  extraPriceAmount: number
}

export interface StudioProduct {
  id: string
  name: string
  note: string
  priceAmount: number
  imageUrl: string
  ingredientIds: string[]
  imageFit?: 'cover' | 'contain'
}

export interface StudioStyle {
  id: string
  imageUrl: string
}

export interface StudioSwatch {
  id: string
  color: string
}

export interface StudioBouquetIngredient {
  ingredient: StudioIngredient
  /** Never below `ingredient.baseQuantity` - stems can only be added at this step. */
  quantity: number
  /** Stems on top of what the design already includes. */
  extraQuantity: number
}

export interface StudioBouquet {
  style?: StudioStyle
  ribbon?: StudioSwatch
  wrap?: StudioSwatch
  products: StudioProduct[]
  ingredients: StudioBouquetIngredient[]
  totalAmount: number
}

export interface StudioMockupExample {
  imageUrl: string
  creator: string
  avatar: string
  title: string
}

export interface StudioMockup {
  id: string
  name: string
  description: string
  moods: string[]
  imageUrl: string
  story: string
  examples: StudioMockupExample[]
}

export interface StudioVersion {
  id: string
  label: number
  name: string
  mockupId: string
  mockupName: string
  imageUrl: string
}

export interface StudioGeneration {
  id: string
  name: string
  productId: string
  productName: string
  mockupId: string
  mockupName: string
  imageUrl: string
  createdAt: string
}
