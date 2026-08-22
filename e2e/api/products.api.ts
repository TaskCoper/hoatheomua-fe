import { CategoryProductPage, type SortableCategory } from '@/features/categories/types'
import { availableOf } from '@/features/products/components/product-variant-context'
import type { ProductDetail } from '@/features/products/types'
import type { Page } from '@playwright/test'
import { unwrap } from './unwrap'

/**
 * The category sections `/products` renders, in on-page order - the same call the page's
 * server component makes (`getCachedCategories({ page: [CategoryProductPage.Products] })`).
 *
 * A product is only reachable on that page through a section, so this is what decides
 * whether a fixture can be found by browsing at all.
 */
export const getProductsPageSections = (page: Page) =>
  unwrap<SortableCategory[]>(page, `/api/v1/category-products/with-children?page=${CategoryProductPage.Products}`)

/**
 * The catalogue's detail endpoint. Note this is the only endpoint that populates
 * `children` - the list endpoint returns it empty for every product, so a variant check
 * has to read the detail.
 */
export const getProduct = (page: Page, id: string) => unwrap<ProductDetail>(page, `/api/v1/products/${id}`)

/**
 * The variants the purchase box offers, using the app's own definition:
 * `children` filtered to entries carrying an id (`ProductVariantProvider`).
 */
export const variantsOf = (product: ProductDetail): ProductDetail[] =>
  (product.children ?? []).filter((child): child is ProductDetail => Boolean(child?.id))

/**
 * What the purchase box will actually let a customer buy.
 *
 * Mirrors `ProductPurchaseBox`: stock is read through `availableOf` (imported, not
 * reimplemented, so it cannot drift), and a product with no variants is bought as itself -
 * `ProductVariantProvider` falls back to `selected = product`. Price is deliberately not
 * part of the rule: `isPurchaseDisabled` gates on stock alone.
 */
export const purchasableUnits = (product: ProductDetail): ProductDetail[] => {
  const variants = variantsOf(product)
  const units = variants.length > 0 ? variants : [product]

  return units.filter((unit) => availableOf(unit) > 0)
}
