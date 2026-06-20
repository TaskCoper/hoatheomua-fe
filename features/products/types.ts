/**
 * Product in list API.
 */
export interface Product extends ProductBase {
  priceVatMode: number
  importPriceVatMode: number
  categoryIds: number
  internalCategoryId: number
  brandId: number
  type: number
  inventory: ProductInventory
}

/**
 * Product in detail API.
 */
export interface ProductDetail extends ProductBase {
  category: ProductCategory | null
  categoryIds: number
  internalCategory: ProductCategory | null
  vat: number
  brand: ProductBrand | null
  type: ProductType
  inventory: ProductDetailInventory
  description: string | null
  content: string | null
  suppliers: ProductSupplier[]
  videos: ProductVideo[]
  branchPrices: ProductBranchPrice[]
  childs: ProductChild[]
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

export interface ProductCombo {
  id: number
  code: string
  name: string
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
 * Inventory shape from product detail API.
 */
export interface ProductDetailInventory {
  remain: number
  shipping: number
  damaged: number
  holding: number
  transfering: number
  warranty: number
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
  warranty: number
  warrantyHolding: number
  holdingNew: number
  shippingExport: number
  available: number
}

export interface ProductCategory {
  id: number
  code: string
  name: string
}

export interface ProductBrand {
  id: number
  name: string
}

export interface ProductType {
  id: number
  name: string
}

export interface ProductWarranty {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductAttribute {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductSupplier {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductVideo {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductBranchPrice {
  // Unknown because sample is always []
  [key: string]: unknown
}

export interface ProductChild {
  // Unknown because sample is always []
  [key: string]: unknown
}
