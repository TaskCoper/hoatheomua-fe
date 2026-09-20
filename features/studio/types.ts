export type StudioStep = 1 | 2 | 3 | 4 | 5

export type StudioGenerationStatus = 'idle' | 'generating' | 'complete'

export interface StudioIngredient {
  id: string
  name: string
  imageUrl: string | null
  baseQuantity: number
  step: number
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

export interface StudioOption {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
}

export interface StudioVariant extends StudioOption {
  priceAmount: number | null
}

export interface StudioBouquetIngredient {
  ingredient: StudioIngredient
  quantity: number
  extraQuantity: number
}

export interface StudioBouquet {
  style?: StudioOption
  ribbon?: StudioOption
  wrap?: StudioOption
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

export interface StudioScene extends StudioOption {
  story?: string | null
  moods?: string[]
  examples?: StudioMockupExample[]
}

export interface StudioVersionMaterial {
  matId: string
  name: string
  isCore: boolean
  imageUrl: string | null
  baseQuantity: number
  extraQuantity: number
  quantity: number
}

export interface StudioVersion {
  id: string
  label: number
  name: string
  productId: string
  mockupId: string
  mockupName: string
  imageUrl: string | null
  createdAt: string | null
  materials: StudioVersionMaterial[]
  style: StudioOption | null
  ribbon: StudioOption | null
  wrap: StudioOption | null
}

export interface StudioGenerationSession {
  sessionId: string
  productId: string
  name: string
  mockupId: string
  mockupName: string
  imageUrl: string | null
  createdAt: string
  versionCount: number
  isFinished: boolean
}

export interface AiFlowerMaterialTotal {
  matId: string
  quantity: number
}

export interface CreateAiFlowerPayload {
  name: string
  productId: string
  materialTotals: AiFlowerMaterialTotal[]
  bundleId: string
  mockupId: string
  ribbonProductId: string
  wrappingPaperProductId: string
}

export interface RegenerateAiFlowerPayload {
  bundleId: string
  mockupId: string
}

export interface AiFlowerProductRef {
  id: string
  name: string
  attributes: {
    productCode: string | null
    productType: string | null
    size: string | null
    color: string | null
  }
  image: { url: string | null }
  observedStatus: { isActive: boolean; isDeleted: boolean }
}

export interface AiFlowerMaterial extends AiFlowerMaterialTotal {
  name: string
  isCore: boolean
  coverImage: string | null
}

export interface AiFlowerMetadata {
  subId: string
  aiCustomize: boolean
  ribbon: AiFlowerProductRef | null
  wrappingPaper: AiFlowerProductRef | null
  AdditionCustome: AiFlowerMaterial[]
  materials: AiFlowerMaterial[]
}

export interface AiFlower {
  id: string
  sessionId: string
  name: string
  imageUrl: string | null
  metadata: AiFlowerMetadata
  createdAt: string
}

export interface GeneratedFlowerRef {
  id: string
  name: string | null
  imageUrl: string | null
}

export interface GeneratedFlower {
  id: string
  historyId: string
  operation: string
  regeneratedFromFlowerId: string | null
  productId: string
  rootProductId: string
  name: string
  imageUrl: string | null
  userId: string
  createdAt: string
  product: GeneratedFlowerRef | null
  bundle: GeneratedFlowerRef | null
  mockup: GeneratedFlowerRef | null
  ribbon: GeneratedFlowerRef | null
  wrappingPaper: GeneratedFlowerRef | null
  metadata: AiFlowerMetadata
}

export interface GeneratedFlowerSession {
  sessionId: string
  latestCreatedAt: string
  flowers: GeneratedFlower[]
}

export interface GetGeneratedFlowersParams {
  sessionId?: string
  pageIndex?: number
  pageSize?: number
}

export interface GeneratedFlowerCompositionMaterial {
  id: string
  name: string
  coverImage: string | null
}

/**
 * `GET v1/ai-flowers/{generatedFlowerId}/composition` - what a finished design is made
 * of. It is the only read a cart line has: the generated name and artwork, the flowers
 * that went in, and `subId`, the orderable product the design was built on.
 */
export interface GeneratedFlowerComposition {
  id: string
  name: string
  coverImage: string
  subId: string
  materials: GeneratedFlowerCompositionMaterial[]
}
