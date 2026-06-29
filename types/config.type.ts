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

export interface CompanyConfigOption {
  label: string
  value: string
}

export interface CompanyConfigValidation {
  url?: boolean
}

interface BaseCompanyConfigValue {
  group: CompanyConfigGroup
  label: string
  options: CompanyConfigOption[]
  required: boolean
  inputType: CompanyConfigInputType
  description?: string
  validations: CompanyConfigValidation[]
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
        options: CompanyConfigOption[]
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

export interface ContactConfigOption {
  label: string
  value: string
}

export interface ContactConfigValidation {
  email?: boolean
  url?: boolean
}

interface BaseContactConfigValue {
  group: ContactConfigGroup
  label: string
  value: string
  options: ContactConfigOption[]
  required: boolean
  inputType: ContactConfigInputType
  description?: string
  validations: ContactConfigValidation[]
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
export type OccasionsConfigKey = 'occasions.collection'

export type OccasionsConfigGroup = 'occasions'

export type OccasionsConfigInputType = 'json'

export interface OccasionsConfigOption {
  label: string
  value: string
}

export interface OccasionsConfigValidation {
  url?: boolean
  email?: boolean
}

export interface LocalizedText {
  vi: string
  en: string
}

export interface OccasionsCollectionSection {
  title: LocalizedText
  description: LocalizedText
  enabled: boolean
}

export interface OccasionsCollectionCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
}

export interface OccasionsCollection {
  section: OccasionsCollectionSection
  cards: OccasionsCollectionCard[]
}

export interface OccasionsCollectionConfigItem {
  key: OccasionsConfigKey
  value: {
    group: OccasionsConfigGroup
    label: string
    value: string
    options: []
    required: boolean
    inputType: OccasionsConfigInputType
    validations: OccasionsConfigValidation[]
  }
}

// Feedbacks
export type FeedbacksConfigKey = 'feedbacks.collection'

export type FeedbacksConfigGroup = 'feedbacks'

export type FeedbacksConfigInputType = 'json'

export interface FeedbacksConfigOption {
  label: string
  value: string
}

export interface FeedbacksConfigValidation {
  url?: boolean
  email?: boolean
}

export interface LocalizedText {
  vi: string
  en: string
}

export interface FeedbacksCollectionSection {
  title: LocalizedText
  description: LocalizedText
  enabled: boolean
}

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
  section: FeedbacksCollectionSection
  items: FeedbackItem[]
}

export interface FeedbacksCollectionConfigItem {
  key: FeedbacksConfigKey
  value: {
    group: FeedbacksConfigGroup
    label: string
    value: string
    options: []
    required: false
    inputType: FeedbacksConfigInputType
    validations: []
  }
}
