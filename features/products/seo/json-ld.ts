import type { ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { buildBreadcrumbList, inLanguage, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/shared/seo'
import { PRODUCT_DEFAULT_FALLBACK_IMAGE, PRODUCTS_LIST_COPY, PRODUCTS_OG_IMAGE_URL } from './config'
import { getProductsListPath, getProductsListUrl, getProductUrl } from './url'

const priceValidUntil = () => {
  const now = new Date()
  return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
}

// `items` are the products the page actually renders above the fold. Google uses
// the ItemList to decide whether a collection page is eligible for the product
// carousel in the SERP, so passing an empty array silently drops that eligibility.
export const buildProductsCollectionJsonLd = (locale: Locale, items: ProductDetail[]) => {
  const copy = PRODUCTS_LIST_COPY[locale]
  const path = getProductsListPath(locale)
  const url = getProductsListUrl(locale)
  const breadcrumb = buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])

  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList' as const,
          '@id': `${SITE_URL}${path}#itemlist`,
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => {
            const productUrl = getProductUrl(locale, product.id)
            const available = (product.availableForSale ?? 0) > 0
            const price = product.price ?? 0
            return {
              '@type': 'ListItem' as const,
              position: index + 1,
              url: productUrl,
              item: {
                '@type': 'Product' as const,
                '@id': `${productUrl}#product`,
                name: product.productName,
                url: productUrl,
                sku: product.id,
                ...(product.coverImage ? { image: product.coverImage } : {}),
                ...(Number.isFinite(price) && price > 0
                  ? {
                      offers: {
                        '@type': 'Offer',
                        url: productUrl,
                        priceCurrency: 'VND',
                        price,
                        availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        itemCondition: 'https://schema.org/NewCondition'
                      }
                    }
                  : {})
              }
            }
          })
        }
      : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: `${copy.title} - Hoa Theo Mùa`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: PRODUCTS_OG_IMAGE_URL },
        ...(itemList ? { mainEntity: { '@id': `${SITE_URL}${path}#itemlist` } } : {})
      },
      breadcrumb,
      ...(itemList ? [itemList] : [])
    ]
  }
}

export const buildProductDetailJsonLd = (locale: Locale, product: ProductDetail) => {
  const productName = product.productName ?? 'Hoa Theo Mùa'
  const productUrl = getProductUrl(locale, product.id)

  const bestAvatar = product.coverImage ?? PRODUCT_DEFAULT_FALLBACK_IMAGE
  const inStock = (product.availableForSale ?? 0) > 0
  const description = `${productName} - Hoa Theo Mùa`

  const listCopy = PRODUCTS_LIST_COPY[locale]
  const breadcrumbId = `${productUrl}#breadcrumb`
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  const price = product.price ?? 0

  const offers = {
    '@type': 'Offer',
    url: productUrl,
    priceCurrency: 'VND',
    price,
    priceValidUntil: priceValidUntil(),
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORGANIZATION_ID }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        url: productUrl,
        name: productName,
        description,
        image: [bestAvatar],
        sku: product.productCode || `htm-${product.id}`,
        mpn: product.productCode || `htm-${product.id}`,
        inLanguage: inLanguage(locale),
        category: product.categoryName ?? undefined,
        brand: { '@type': 'Brand', name: product.brand ?? 'Hoa Theo Mùa' },
        offers
      },
      buildBreadcrumbList(locale, breadcrumbId, [
        { name: listCopy.breadcrumb, url: getProductsListUrl(locale) },
        { name: productName, url: productUrl }
      ])
    ]
  }
}
