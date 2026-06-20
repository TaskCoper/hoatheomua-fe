export interface AhamoveResult {
  service_id: string
  data: AhamoveQuoteData
}

export interface AhamoveQuoteData {
  distance: number
  duration: number

  distance_fee: number
  request_fee: number
  stop_fee: number
  vat_fee: number
  discount: number

  total_fee: number
  total_price: number

  requests: AhamoveRequestOption[]
}

export interface AhamoveRequestOption {
  _id: string
  num: number
  price: number
  tier_code: string | null
}

/* =========================
 * NHANH PRODUCT RESULT
 * ========================= */

export interface ProductNhanhResult {
  code: number
  paginator: NhanhPaginator
  data: ProductNhanh[]
}

export interface NhanhPaginator {
  next: string | null
}

export interface ProductNhanh {
  id: number
  parentId: number
  code: string
  barcode: string
  name: string
  otherName: string | null

  status: number
  priceVatMode: number
  importPriceVatMode: number

  categoryIds: number | null
  internalCategoryId: number | null

  prices: ProductNhanhPrices
  images: ProductNhanhImages

  warranty: ProductWarranty[] | null
  brandId: number | null

  type: number
  shipping: ProductShipping

  countryName: string | null
  units: ProductUnits

  combos: ProductCombo[]
  inventory: ProductInventory

  attributes: ProductAttribute[]

  updatedAt: number
  createdAt: number
}

export interface ProductNhanhPrices {
  retail: number
  retailVat: number
  import: number
  importVat: number
  old: number
  wholesale: number
  avgCost: number
}

export interface ProductNhanhImages {
  avatar: string
  others: string[]
}

export interface ProductShipping {
  width: number
  height: number
  length: number
  weight: number
}

export interface ProductUnits {
  name: string
  list: ProductUnitItem[]
}

export interface ProductUnitItem {
  id?: number
  name?: string
  ratio?: number
}

export interface ProductInventory {
  remain: number
  shipping: number
  damaged: number
  holding: number
  transfering: number
  available: number

  warranty: InventoryWarranty
  depots: ProductDepotInventory[]
}

export interface InventoryWarranty {
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

  warranty: InventoryWarranty
}

export interface ProductWarranty {
  id?: number
  name?: string
  value?: string | number
}

export interface ProductCombo {
  id?: number
  name?: string
  quantity?: number
}

export interface ProductAttribute {
  id?: number
  name?: string
  value?: string | number | null
}
