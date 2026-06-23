export interface NewsItem {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  author: string
  publishedAt: string
  readTime: string
  tags: string[]
  pictureUrl: string
}

export interface NewsApiItem {
  id: string
  title: string
  description: string
  viewCount: number
  pictureUrl: string
  status: string
  userId: string
  categoryIds: string[]
  createdAt: string
  updatedAt: string | null
}

export interface NewsPageResult {
  items: NewsItem[]
  pageIndex: number
  hasNextPage: boolean
  totalCount: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const mapNewsItem = (item: NewsApiItem): NewsItem => {
  const stripHtml = item.description?.replace(/<[^>]*>/g, '').trim() || ''
  const summary = stripHtml.substring(0, 160) + (stripHtml.length > 160 ? '...' : '')

  let imageUrl = item.pictureUrl || ''

  if (!imageUrl || imageUrl.toLowerCase() === 'string') {
    imageUrl = ''
  } else if (imageUrl.startsWith('http')) {
    if (API_BASE_URL && !imageUrl.includes(API_BASE_URL)) {
      imageUrl = ''
    }
  } else if (API_BASE_URL) {
    if (imageUrl.replace(/^\/+/, '') === 'string') {
      imageUrl = ''
    } else {
      imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
  }

  return {
    id: item.id,
    slug: createSlug(item.title) || item.id,
    title: item.title,
    summary,
    content: item.description,
    category: 'Tin tức',
    author: 'Hoa Theo Mùa',
    publishedAt: item.createdAt,
    readTime: `${Math.max(1, Math.ceil(stripHtml.split(/\s+/).filter(Boolean).length / 80))} phút đọc`,
    tags: item.categoryIds || [],
    pictureUrl: imageUrl
  }
}

export function formatNewsDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}
