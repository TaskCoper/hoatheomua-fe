export type StudioStep = 1 | 2 | 3 | 4 | 5

export type StudioGenerationStatus = 'idle' | 'generating' | 'complete'

export interface StudioIngredient {
  id: string
  imageUrl: string
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

/** A size is really a flower count: S holds 1 bloom group, M holds 2, L holds 3. */
export interface StudioSize {
  id: string
  label: string
  flowerCount: number
  /** Multiplies the combined flower price to cover the extra wrap and labour. */
  priceMultiplier: number
}

export interface StudioStyle {
  id: string
  imageUrl: string
}

export interface StudioSwatch {
  id: string
  color: string
}

export interface StudioBouquet {
  size?: StudioSize
  style?: StudioStyle
  ribbon?: StudioSwatch
  wrap?: StudioSwatch
  products: StudioProduct[]
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
