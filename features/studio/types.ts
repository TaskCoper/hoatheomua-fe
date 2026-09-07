export type StudioStep = 1 | 2 | 3 | 4

export type StudioGenerationStatus = 'idle' | 'generating' | 'complete'

export interface StudioIngredient {
  id: string
  imageUrl: string
}

export interface StudioProduct {
  id: string
  name: string
  note: string
  price: string
  imageUrl: string
  ingredientIds: string[]
  imageFit?: 'cover' | 'contain'
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
