export type StudioStep = 1 | 2 | 3 | 4 | 5

export type StudioGenerationStatus = 'idle' | 'generating' | 'complete'

export interface StudioIngredient {
  id: string
  name: string
  imageUrl: string | null
  baseQuantity: number
  extraPriceAmount: number | null
}

export interface StudioProduct {
  id: string
  name: string
  note: string | null
  priceAmount: number
  imageUrl: string | null
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
  imageUrl: string | null
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
