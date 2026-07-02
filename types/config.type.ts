// Shared primitives
export interface LocalizedText {
  vi: string
  en: string
}

export interface ConfigOption {
  label: string
  value: string
}

export interface ConfigValidation {
  url?: boolean
  email?: boolean
}

export interface CollectionSection {
  title: LocalizedText
  description: LocalizedText
  enabled: boolean
}

/**
 * Generic wrapper for configs whose value is a JSON-encoded string
 * (Occasions, Mainline, Feedbacks, Products signature, etc.).
 * Parse `value.value` into the collection shape before rendering.
 */
export interface JsonConfigItem<K extends string, G extends string, R extends boolean = false> {
  key: K
  value: {
    group: G
    label: string
    value: string
    options: []
    required: R
    inputType: 'json'
    validations: []
  }
}

// Company
export type CompanyConfigKey =
  | 'company.director'
  | 'company.gpkd'
  | 'company.info'
  | 'company.bg_music'
  | 'company.hotlines'
  | 'company.website'
  | 'company.bg_video'

export type CompanyConfigGroup = 'company'

export type CompanyConfigInputType = 'text' | 'file' | 'multiSelect'

interface BaseCompanyConfigValue {
  group: CompanyConfigGroup
  label: string
  options: ConfigOption[]
  required: boolean
  inputType: CompanyConfigInputType
  description?: string
  validations: ConfigValidation[]
}

export type CompanyConfigItem =
  | {
      key: 'company.director'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'text'
        required: true
        options: []
        validations: []
      }
    }
  | {
      key: 'company.gpkd'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'text'
        required: true
        options: []
        validations: []
      }
    }
  | {
      key: 'company.info'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'text'
        required: true
        options: []
        description: string
        validations: []
      }
    }
  | {
      key: 'company.bg_music'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'file'
        required: false
        options: []
        validations: [{ url: true }]
      }
    }
  | {
      key: 'company.hotlines'
      value: BaseCompanyConfigValue & {
        value: string[]
        inputType: 'multiSelect'
        required: true
        options: ConfigOption[]
        validations: []
      }
    }
  | {
      key: 'company.website'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'text'
        required: false
        options: []
        validations: [{ url: true }]
      }
    }
  | {
      key: 'company.bg_video'
      value: BaseCompanyConfigValue & {
        value: string
        inputType: 'file'
        required: false
        options: []
        validations: [{ url: true }]
      }
    }

// Contact
export type ContactConfigKey =
  | 'contact.phone'
  | 'contact.email'
  | 'contact.zalo'
  | 'contact.facebook'
  | 'contact.instagram'

export type ContactConfigGroup = 'contact'

export type ContactConfigInputType = 'text'

interface BaseContactConfigValue {
  group: ContactConfigGroup
  label: string
  value: string
  options: ConfigOption[]
  required: boolean
  inputType: ContactConfigInputType
  description?: string
  validations: ConfigValidation[]
}

export type ContactConfigItem =
  | {
      key: 'contact.phone'
      value: BaseContactConfigValue & {
        required: true
        options: []
        validations: []
      }
    }
  | {
      key: 'contact.email'
      value: BaseContactConfigValue & {
        required: true
        options: []
        description: string
        validations: [{ email: true }]
      }
    }
  | {
      key: 'contact.zalo'
      value: BaseContactConfigValue & {
        required: true
        options: []
        description: string
        validations: [{ url: true }]
      }
    }
  | {
      key: 'contact.facebook'
      value: BaseContactConfigValue & {
        required: true
        options: []
        validations: [{ url: true }]
      }
    }
  | {
      key: 'contact.instagram'
      value: BaseContactConfigValue & {
        required: true
        options: []
        validations: [{ url: true }]
      }
    }

// Occasions
export interface OccasionCampaign {
  id: string
  campaignName: LocalizedText
  skuPrefix: string
  startDate: string
  endDate: string
  categoryIds: string[]
  badge: LocalizedText
  enabled: boolean
}

export interface BaseCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
}

export interface OccasionCard extends BaseCard {
  accent?: string
  campaigns: OccasionCampaign[]
}

export interface OccasionsCollection {
  section: CollectionSection
  cards: OccasionCard[]
}

export type OccasionsCollectionConfigItem = JsonConfigItem<'products.occasions', 'products'>

// Mainline
export type MainlineCard = BaseCard

export interface MainlineCollection {
  section: CollectionSection
  cards: MainlineCard[]
}

export type MainlineCollectionConfigItem = JsonConfigItem<'products.mainline', 'products'>

// Feedbacks
export type FeedbackSource = 'messenger' | 'zalo' | 'other'

export interface FeedbackItem {
  id: string
  customerName: string
  area: string
  content: LocalizedText
  flowerType: string
  image: string
  postDate: string
  rating: number
  featured: boolean
  isPlaceholder: boolean
  source: FeedbackSource
  sourceUrl: string
}

export interface FeedbacksCollection {
  section: CollectionSection
  items: FeedbackItem[]
}

export type FeedbacksCollectionConfigItem = JsonConfigItem<'feedbacks.collection', 'feedbacks'>

// Products
export interface ProductSignatureMap {
  [productId: string]: string
}

export type ProductsSignatureConfigItem = JsonConfigItem<'products.signature', 'products', true>

// Order tags
export interface OrderTag {
  value: number[]
  options: { label: string; value: number }[]
}

// Banners
export type BannersConfigKey = 'banners.collection'

export type BannersConfigGroup = 'banners'

export type BannersConfigInputType = 'json'

export type BannersConfigKind = 'content'

export const BANNER_SLOTS = {
  homeCollection: 'home.collection',
  homeSale: 'home.sale',
  products: 'products',
  product: 'product'
} as const

export type BannerSlotKnown = (typeof BANNER_SLOTS)[keyof typeof BANNER_SLOTS]

export type BannerSlot = BannerSlotKnown | (string & {})

export interface BannersCollectionSection {
  enabled: boolean
}

export interface BannerItem {
  id: string
  slot: BannerSlot
  image: string
  href: string
  openInNewTab: boolean
  alt: LocalizedText
  enabled: boolean
}

export interface BannersCollection {
  section: BannersCollectionSection
  items: BannerItem[]
}

export interface BannersCollectionConfigValue {
  group: BannersConfigGroup
  label: string

  /**
   * Backend stores this as JSON string.
   * Parse it into BannersCollection before rendering/editing.
   */
  value: string

  options: []
  required: false
  inputType: BannersConfigInputType
  validations: []
}

export interface BannersCollectionConfigItem {
  id: string
  key: BannersConfigKey
  group: BannersConfigGroup
  isPublic: boolean
  value: BannersCollectionConfigValue
  kind: BannersConfigKind
  userId: string
}
