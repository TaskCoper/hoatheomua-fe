import type { LocaleCopy, SeoCopy } from '@/shared/seo'
import { buildOgImageUrl } from '@/shared/seo'

export const NEWS_BASE_PATH = '/news'

type NewsCopy = SeoCopy & { breadcrumb: string; pageLabel: string }

export const NEWS_LIST_COPY = {
  vi: {
    title: 'Tin Tức & Cảm Hứng Hoa',
    description:
      'Cập nhật tin tức, mẹo chăm hoa và cảm hứng cắm hoa theo mùa từ Hoa Theo Mùa - từ bí quyết giữ hoa tươi lâu, ý tưởng decor đến những câu chuyện đẹp về 12 mùa hoa Hà Nội.',
    keywords: [
      'tin tức hoa tươi',
      'cách chăm sóc hoa',
      'mẹo cắm hoa',
      'cảm hứng hoa theo mùa',
      'blog hoa Hoa Theo Mùa',
      'ý tưởng decor hoa',
      '12 mùa hoa Hà Nội',
      'cẩm nang hoa tươi'
    ],
    ogAlt: 'Tin tức và cảm hứng hoa từ Hoa Theo Mùa',
    breadcrumb: 'Tin tức',
    pageLabel: 'Trang'
  },
  en: {
    title: 'Flower Stories & Inspiration',
    description:
      'Seasonal flower stories, care tips and arrangement ideas from Hoa Theo Mùa - keep blooms fresh longer, find decor inspiration and explore the 12 flower seasons of Hanoi.',
    keywords: [
      'flower news',
      'flower care tips',
      'flower arrangement ideas',
      'seasonal flower inspiration',
      'Hoa Theo Mùa blog',
      'floral decor ideas',
      'Hanoi flower seasons',
      'florist journal Vietnam'
    ],
    ogAlt: 'Hoa Theo Mùa - Flower stories and inspiration',
    breadcrumb: 'News',
    pageLabel: 'Page'
  }
} satisfies LocaleCopy<NewsCopy>

export const NEWS_OG_IMAGE_PATH = '/images/bg-news-1.png'
export const NEWS_OG_IMAGE_URL = buildOgImageUrl(NEWS_OG_IMAGE_PATH)
