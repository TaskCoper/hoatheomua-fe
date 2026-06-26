import type { BaseResponse } from '@/lib/axios'

export interface ProductListPayload {
  code: number
  data: Product[]
  paginator?: {
    next: { id: number } | null
  }
}

export interface ProductDetailPayload {
  code: number
  data: ProductDetail | null
}

export type ProductListResponse = BaseResponse<ProductListPayload>
export type ProductDetailResponse = BaseResponse<ProductDetailPayload>

export interface Product extends ProductBase {
  priceVatMode: number
  importPriceVatMode: number
  categoryIds: number
  internalCategoryId: number
  brandId: number
  type: number
  inventory: ProductInventory
}

export interface ProductDetail {
  id: number
  parentId: number
  code: string | null
  barcode: string | null
  name: string | null
  status: number
  category: ProductCategory | null
  categoryId: number
  internalCategory: ProductCategory | null
  prices: ProductPrices | null
  vat: number
  images: ProductImages | null
  warranty: unknown
  brand: ProductCommonInfo | null
  brandId: number | null
  type: ProductCommonInfo | null
  shipping: ProductShipping | null
  countryName: string | null
  units: ProductDetailUnits | null
  combos: ProductCombo[]
  inventory: ProductDetailInventory | null
  attributes: ProductDetailAttribute[]
  updatedAt: number
  createdAt: number
  description: string | null
  content: string | null
  suppliers: ProductDetailSupplier[]
  videos: ProductDetailVideo[]
  branchPrices: ProductBranchPrice[]
  childs: ProductDetail[]
}

export interface ProductBase {
  id: number
  parentId: number
  code: string
  barcode: string
  name: string
  status: number
  prices: ProductPrices
  images: ProductImages
  warranty: ProductWarranty[]
  shipping: ProductShipping
  countryName: string | null
  units: ProductUnits
  combos: ProductCombo[]
  attributes: ProductAttribute[]
  updatedAt: number
  createdAt: number
}

export interface ProductPrices {
  retail: number
  retailVat: number
  import: number
  importVat: number
  old: number
  wholesale: number
  avgCost: number
}

export interface ProductImages {
  avatar: string | null
  others: string[]
}

export interface ProductShipping {
  width: number
  height: number
  length: number
  weight: number
}

export interface ProductUnits {
  name: string | null
  list: ProductUnit[]
}

export interface ProductUnit {
  id: number
  name: string
  quantity: number
  price: ProductUnitPrice
}

export interface ProductUnitPrice {
  retail: number
  import: number
  wholesale: number
}

/**
 * Units shape from product detail API. `list` is keyed by unit category
 * (e.g. variant group), with each entry containing the actual units.
 */
export interface ProductDetailUnits {
  name: string | null
  list: Record<string, ProductUnit[]> | null
}

export interface ProductCombo {
  id: number
  code: string | null
  name: string | null
  quantity: number
}

/**
 * Inventory shape from product list API.
 */
export interface ProductInventory {
  remain: number
  shipping: number
  damaged: number
  holding: number

  /**
   * API field is spelled `transfering`, keep exact key from response.
   */
  transfering: number

  available: number
  warranty: ProductInventoryWarranty
  depots: ProductDepotInventory[]
}

export interface ProductInventoryWarranty {
  remain: number
  holding: number
}

export interface ProductDepotInventory {
  id: number
  remain: number
  shipping: number
  damaged: number
  holding: number
  transfering: number
  available: number
  warranty: ProductInventoryWarranty
}

/**
 * Inventory shape from product detail API. `warranty` is flexible: backend may
 * return either a primitive (e.g. `0`) or an object — kept loose to match.
 */
export interface ProductDetailInventory {
  remain: number
  shipping: number
  damaged: number
  holding: number
  transfering: number
  warranty: number | ProductInventoryWarranty | null
  warrantyHolding: number
  holdingNew: number
  shippingExport: number
  available: number
  depots: ProductDetailDepotInventory[]
}

export interface ProductDetailDepotInventory {
  id: number
  remain: number
  shipping: number
  damaged: number
  holding: number
  transfering: number
  warranty: number | ProductInventoryWarranty | null
  warrantyHolding: number
  holdingNew: number
  shippingExport: number
  available: number
}

export interface ProductCategory {
  id: number
  code: string | null
  name: string | null
}

/**
 * Shared id/name shape used by `brand`, `type`, and branch references.
 */
export interface ProductCommonInfo {
  id: number
  name: string | null
}

export interface ProductWarranty {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductAttribute {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductDetailAttribute {
  id: number
  name: string | null
  value: string | null
}

export interface ProductDetailSupplier {
  id: number
  name: string | null
  mobile: string | null
}

export interface ProductDetailVideo {
  title: string | null
  src: string | null
}

export interface ProductBranchPrice {
  branch: ProductCommonInfo | null
  price: number
  wholesalePrice: number
}
