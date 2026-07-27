export const CategoryProductType = {
  Fix: 'Fix',
  Campaign: 'Campaign'
} as const

export type CategoryProductType = (typeof CategoryProductType)[keyof typeof CategoryProductType]

export interface Category {
  categoryId: string
  name: string
  name_En: string | null

  description: string | null
  description_En: string | null

  position: number | null

  metaData: string | null

  startTime: string | null
  endTime: string | null

  type: CategoryProductType
  isActive: boolean

  userId: string
  parentId: string | null

  parent: Category | null
  children: Category[]

  productCount: number | null
  productIds: string[] | null
}

export interface CategoryMetadata {
  filterByName?: boolean
  filterByPrice?: boolean
  isFilterable?: boolean
}

export interface SortableCategory {
  categoryId: string
  name: string
  nameEn: string | null
  description: string | null
  descriptionEn: string | null
  position: number | null
  metaData: string | null
  startTime: string | null
  endTime: string | null
  type: CategoryProductType
  userId: string
  parentId: string | null
  children: SortableCategory[]
}
