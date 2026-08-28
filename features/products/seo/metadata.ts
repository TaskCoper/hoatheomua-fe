import type { ProductDetail } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import { buildPageMetadata, DEFAULT_OG_IMAGE_DIMENSIONS } from '@/shared/seo'
import type { Metadata } from 'next'
import { PRODUCTS_BASE_PATH, PRODUCTS_LIST_COPY, PRODUCTS_OG_IMAGE_PATH } from './config'

const META_DESCRIPTION_MAX_LENGTH = 155

const truncate = (value: string, max: number) => (value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`)

export const generateProductsListMetadata = (locale: Locale): Metadata => {
  const copy = PRODUCTS_LIST_COPY[locale]
  return buildPageMetadata({
    locale,
    copy,
    basePath: PRODUCTS_BASE_PATH,
    ogImage: {
      url: PRODUCTS_OG_IMAGE_PATH,
      width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
      height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
      alt: copy.ogAlt ?? copy.title
    },
    extras: { category: 'shopping' }
  })
}

type GenerateProductDetailMetadataInput = {
  locale: Locale
  product: ProductDetail | null
}

const PRODUCT_NOT_FOUND_METADATA: Metadata = {
  title: 'Không tìm thấy sản phẩm',
  description: 'Sản phẩm bạn đang tìm không còn tồn tại hoặc đã được dời sang đường dẫn khác.',
  robots: { index: false, follow: true }
}

export const generateProductDetailMetadata = ({ locale, product }: GenerateProductDetailMetadataInput): Metadata => {
  if (!product) return PRODUCT_NOT_FOUND_METADATA

  const productName = product.productName ?? 'Hoa Theo Mùa'
  const rawDescription = `${productName} - Hoa Theo Mùa`
  const description = truncate(rawDescription, META_DESCRIPTION_MAX_LENGTH)

  const bestAvatar = product.coverImage ?? null
  const avatar = bestAvatar ?? PRODUCTS_OG_IMAGE_PATH
  const ogImage = bestAvatar
    ? { url: avatar, alt: productName }
    : {
        url: avatar,
        width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
        height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
        alt: productName
      }

  const keywords = Array.from(
    new Set(
      [
        productName,
        product.categoryName,
        product.brand,
        'hoa tươi',
        'shop hoa',
        'Hoa Theo Mùa',
        'giao hoa TP HCM'
      ].filter((value): value is string => Boolean(value))
    )
  )

  const bestPrice = product.price ?? 0
  const anyInStock = (product.sellableQuantity ?? 0) > 0

  const productOgTags: Record<string, string> = {}
  if (bestPrice > 0) {
    productOgTags['product:price:amount'] = String(bestPrice)
    productOgTags['product:price:currency'] = 'VND'
    productOgTags['og:price:amount'] = String(bestPrice)
    productOgTags['og:price:currency'] = 'VND'
  }
  productOgTags['product:availability'] = anyInStock ? 'in stock' : 'out of stock'
  productOgTags['og:availability'] = anyInStock ? 'instock' : 'oos'
  if (product.brand) productOgTags['product:brand'] = product.brand
  if (product.categoryName) productOgTags['product:category'] = product.categoryName

  return buildPageMetadata({
    locale,
    copy: { title: productName, description, keywords },
    basePath: `${PRODUCTS_BASE_PATH}/${product.id}`,
    ogImage,
    extras: {
      openGraph: { title: `${productName} - Hoa Theo Mùa` },
      twitter: { title: `${productName} - Hoa Theo Mùa` },
      category: 'shopping',
      other: productOgTags
    }
  })
}
