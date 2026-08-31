import type { LocaleCopy, SeoCopy } from '@/shared/seo'
import { buildOgImageUrl, SITE_URL } from '@/shared/seo'

export const PRODUCTS_BASE_PATH = '/products'

type ProductsCopy = SeoCopy & { breadcrumb: string }

export const PRODUCTS_LIST_COPY = {
  vi: {
    title: 'Bộ Sưu Tập Hoa Tươi',
    description:
      'Khám phá bộ sưu tập hoa tươi cao cấp của Hoa Theo Mùa - bó hoa sinh nhật, hoa khai trương, lan hồ điệp, hoa cưới và hơn 50 thiết kế theo mùa, giao tận nơi trong 2 giờ tại TP. HCM.',
    keywords: [
      'bó hoa tươi',
      'hoa sinh nhật',
      'hoa khai trương',
      'lan hồ điệp',
      'hoa cưới',
      'shop hoa Hồ Chí Minh',
      'đặt hoa online',
      'giao hoa tận nơi',
      'hoa theo mùa',
      'bó hoa cao cấp'
    ],
    ogAlt: 'Bộ sưu tập hoa tươi Hoa Theo Mùa',
    breadcrumb: 'Sản phẩm'
  },
  en: {
    title: 'Fresh Flower Collection',
    description:
      'Discover Hoa Theo Mùa premium fresh flower collection - birthday bouquets, opening flowers, orchids, wedding bouquets and 50+ seasonal designs, delivered in 2 hours in Ho Chi Minh City.',
    keywords: [
      'fresh flower bouquet',
      'birthday flowers Vietnam',
      'opening flowers HCMC',
      'phalaenopsis orchid',
      'wedding bouquet Saigon',
      'flower delivery HCMC',
      'order flowers online',
      'seasonal flowers Vietnam'
    ],
    ogAlt: 'Hoa Theo Mùa - Fresh flower collection',
    breadcrumb: 'Products'
  }
} satisfies LocaleCopy<ProductsCopy>

export const PRODUCTS_OG_IMAGE_PATH = '/images/hero-poster.jpg'
export const PRODUCTS_OG_IMAGE_URL = buildOgImageUrl(PRODUCTS_OG_IMAGE_PATH)

export const PRODUCT_DEFAULT_FALLBACK_IMAGE = `${SITE_URL}/images/hero-poster.jpg`
