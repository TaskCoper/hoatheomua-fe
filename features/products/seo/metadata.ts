import type { Locale } from '@/lib/i18n/routing'
import type { ProductDetail } from '@/features/products/types'
import { buildPageMetadata, DEFAULT_OG_IMAGE_DIMENSIONS } from '@/shared/seo'
import type { Metadata } from 'next'
import {
  PRODUCTS_BASE_PATH,
  PRODUCTS_LIST_COPY,
  PRODUCTS_OG_IMAGE_PATH
} from './config'

const META_DESCRIPTION_MAX_LENGTH = 155

const stripHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const truncate = (value: string, max: number) =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`

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

export const generateProductDetailMetadata = ({
  locale,
  product
}: GenerateProductDetailMetadataInput): Metadata => {
  if (!product) return PRODUCT_NOT_FOUND_METADATA

  const productName = product.name ?? 'Hoa Theo Mùa'
  const cleanDescription = stripHtml(product.description) || `${productName} — Hoa Theo Mùa`
  const description = truncate(cleanDescription, META_DESCRIPTION_MAX_LENGTH)
  const avatar = product.images?.avatar ?? PRODUCTS_OG_IMAGE_PATH
  const ogImage = product.images?.avatar
    ? { url: avatar, alt: productName }
    : {
        url: avatar,
        width: DEFAULT_OG_IMAGE_DIMENSIONS.width,
        height: DEFAULT_OG_IMAGE_DIMENSIONS.height,
        alt: productName
      }

  const keywords = [
    productName,
    product.category?.name,
    product.brand?.name,
    'hoa tươi',
    'shop hoa',
    'Hoa Theo Mùa',
    'giao hoa TP HCM'
  ].filter((value): value is string => Boolean(value))

  return buildPageMetadata({
    locale,
    copy: { title: productName, description, keywords },
    basePath: `${PRODUCTS_BASE_PATH}/${product.id}`,
    ogImage,
    extras: {
      openGraph: { title: `${productName} — Hoa Theo Mùa` },
      twitter: { title: `${productName} — Hoa Theo Mùa` },
      category: 'shopping'
    }
  })
}
