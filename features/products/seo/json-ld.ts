import type { Product, ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { buildBreadcrumbList, inLanguage, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/shared/seo'
import { PRODUCT_DEFAULT_FALLBACK_IMAGE, PRODUCTS_LIST_COPY, PRODUCTS_OG_IMAGE_URL } from './config'
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
  const breadcrumb = buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])

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
  const childs = product.childs ?? []

  const parentAvatar = product.images?.avatar
  const bestAvatar =
    parentAvatar ?? childs.find((child) => child.images?.avatar)?.images?.avatar ?? PRODUCT_DEFAULT_FALLBACK_IMAGE
  const allImages = Array.from(
    new Set(
      [
        parentAvatar,
        ...(product.images?.others ?? []),
        ...childs.map((child) => child.images?.avatar),
        ...childs.flatMap((child) => child.images?.others ?? [])
      ].filter((url): url is string => typeof url === 'string' && url.startsWith('http'))
    )
  )

  const parentInStock = (product.inventory?.available ?? 0) > 0
  const anyChildInStock = childs.some((child) => (child.inventory?.available ?? 0) > 0)
  const inStock = parentInStock || anyChildInStock

  const description =
    stripHtml(product.description) ||
    stripHtml(childs.find((child) => stripHtml(child.description))?.description) ||
    `${productName} — Hoa Theo Mùa`

  const listCopy = PRODUCTS_LIST_COPY[locale]
  const breadcrumbId = `${productUrl}#breadcrumb`
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

  const variantOffers = childs
    .map((child) => ({
      price: child.prices?.retail ?? 0,
      available: (child.inventory?.available ?? 0) > 0,
      sku: child.code || `htm-${child.id}`,
      name: child.name ?? productName
    }))
    .filter((offer) => offer.price > 0)

  const parentPrice = product.prices?.retail ?? 0
  const priceCandidates =
    variantOffers.length > 0 ? variantOffers.map((o) => o.price) : parentPrice > 0 ? [parentPrice] : []
  const useAggregate = variantOffers.length > 1
  const lowPrice = priceCandidates.length > 0 ? Math.min(...priceCandidates) : 0
  const highPrice = priceCandidates.length > 0 ? Math.max(...priceCandidates) : 0

  const offers = useAggregate
    ? {
        '@type': 'AggregateOffer',
        url: productUrl,
        priceCurrency: 'VND',
        lowPrice,
        highPrice,
        offerCount: variantOffers.length,
        availability,
        offers: variantOffers.map((offer) => ({
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'VND',
          price: offer.price,
          priceValidUntil: priceValidUntil(),
          availability: offer.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          sku: offer.sku,
          seller: { '@id': ORGANIZATION_ID }
        }))
      }
    : {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'VND',
        price: lowPrice || parentPrice,
        priceValidUntil: priceValidUntil(),
        availability,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': ORGANIZATION_ID }
      }

  const hasVariant = childs
    .filter((child) => (child.attributes?.length ?? 0) > 0 || child.images?.avatar || (child.prices?.retail ?? 0) > 0)
    .map((child) => ({
      '@type': 'Product',
      '@id': `${productUrl}#variant-${child.id}`,
      name: child.name ?? productName,
      sku: child.code || `htm-${child.id}`,
      ...(child.images?.avatar ? { image: child.images.avatar } : {}),
      ...(child.attributes?.length
        ? {
            additionalProperty: child.attributes.map((attribute) => ({
              '@type': 'PropertyValue',
              name: attribute.name,
              value: attribute.value
            }))
          }
        : {}),
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'VND',
        price: child.prices?.retail ?? 0,
        availability:
          (child.inventory?.available ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': ORGANIZATION_ID }
      }
    }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        url: productUrl,
        name: productName,
        description,
        image: allImages.length > 0 ? allImages : [bestAvatar],
        sku: product.code || `htm-${product.id}`,
        mpn: product.code || `htm-${product.id}`,
        inLanguage: inLanguage(locale),
        category: product.category?.name ?? undefined,
        brand: { '@type': 'Brand', name: product.brand?.name ?? 'Hoa Theo Mùa' },
        offers,
        ...(hasVariant.length > 0 ? { hasVariant } : {})
      },
      buildBreadcrumbList(locale, breadcrumbId, [
        { name: listCopy.breadcrumb, url: getProductsListUrl(locale) },
        { name: productName, url: productUrl }
      ])
    ]
  }
}
