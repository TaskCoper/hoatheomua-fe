import type { Locale } from '@/lib/i18n/routing'
import type { Product, ProductDetail } from '@/features/products/types'
import { buildBreadcrumbList, inLanguage, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/shared/seo'
import {
  PRODUCT_DEFAULT_FALLBACK_IMAGE,
  PRODUCTS_LIST_COPY,
  PRODUCTS_OG_IMAGE_URL
} from './config'
import { getProductsListPath, getProductsListUrl, getProductUrl } from './url'

const priceValidUntil = () => {
  const now = new Date()
  return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
}

const stripHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const buildProductsCollectionJsonLd = (locale: Locale, items: Product[]) => {
  const copy = PRODUCTS_LIST_COPY[locale]
  const path = getProductsListPath(locale)
  const url = getProductsListUrl(locale)
  const breadcrumb = buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [
    { name: copy.breadcrumb, url }
  ])

  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList' as const,
          '@id': `${SITE_URL}${path}#itemlist`,
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => {
            const productUrl = getProductUrl(locale, product.id)
            const available = (product.inventory?.available ?? 0) > 0
            return {
              '@type': 'ListItem' as const,
              position: index + 1,
              url: productUrl,
              item: {
                '@type': 'Product' as const,
                '@id': `${productUrl}#product`,
                name: product.name,
                url: productUrl,
                sku: String(product.id),
                ...(product.images?.avatar ? { image: product.images.avatar } : {}),
                ...(product.prices?.retail
                  ? {
                      offers: {
                        '@type': 'Offer',
                        url: productUrl,
                        priceCurrency: 'VND',
                        price: product.prices.retail,
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
        name: `${copy.title} — Hoa Theo Mùa`,
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
  const productName = product.name ?? 'Hoa Theo Mùa'
  const productUrl = getProductUrl(locale, product.id)
  const avatar = product.images?.avatar ?? PRODUCT_DEFAULT_FALLBACK_IMAGE
  const allImages = [avatar, ...(product.images?.others ?? [])].filter(
    (url): url is string => Boolean(url) && url.startsWith('http')
  )
  const inStock = (product.inventory?.available ?? 0) > 0
  const description = stripHtml(product.description) || `${productName} — Hoa Theo Mùa`
  const listCopy = PRODUCTS_LIST_COPY[locale]
  const breadcrumbId = `${productUrl}#breadcrumb`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        url: productUrl,
        name: productName,
        description,
        image: allImages.length > 0 ? allImages : [avatar],
        sku: product.code || `htm-${product.id}`,
        mpn: product.code || `htm-${product.id}`,
        inLanguage: inLanguage(locale),
        category: product.category?.name ?? undefined,
        brand: { '@type': 'Brand', name: product.brand?.name ?? 'Hoa Theo Mùa' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'VND',
          price: product.prices?.retail ?? 0,
          priceValidUntil: priceValidUntil(),
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': ORGANIZATION_ID }
        }
      },
      buildBreadcrumbList(locale, breadcrumbId, [
        { name: listCopy.breadcrumb, url: getProductsListUrl(locale) },
        { name: productName, url: productUrl }
      ])
    ]
  }
}
