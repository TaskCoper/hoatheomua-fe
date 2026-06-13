import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

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

interface NewsApiItem {
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

interface NewsApiResponse {
  value: {
    items: NewsApiItem[]
    pageIndex: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  isSuccess: boolean
  isFailed: boolean
  error: unknown
  traceId: string
  timestampUtc: string
}

// Interface mới cho API chi tiết
interface NewsDetailApiResponse {
  value: NewsApiItem
  isSuccess: boolean
  isFailed: boolean
  error: unknown
  traceId: string
  timestampUtc: string
}

const PAGE_SIZE = 10

const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const mapNewsItem = (item: NewsApiItem): NewsItem => {
  const stripHtml = item.description?.replace(/<[^>]*>/g, '').trim() || ''
  const summary = stripHtml.substring(0, 160) + (stripHtml.length > 160 ? '...' : '')

  // Xử lý đường dẫn ảnh từ API (nếu là đường dẫn tương đối thì nối với Base URL)
  let imageUrl = item.pictureUrl
  if (imageUrl && !imageUrl.startsWith('http') && API_BASE_URL) {
    imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  }

  return {
    id: item.id,
    slug: createSlug(item.title) || item.id,
    title: item.title,
    summary: summary,
    content: item.description, 
    category: 'Tin tức',
    author: 'Hoa Theo Mùa',
    publishedAt: item.createdAt,
    readTime: `${Math.max(1, Math.ceil(stripHtml.split(/\s+/).filter(Boolean).length / 80))} phút đọc`,
    tags: item.categoryIds || [],
    // Thêm trường này vào interface NewsItem nếu chưa có, hoặc tạm gán đè vào một biến mới
    pictureUrl: imageUrl || '' 
  }
}

const fetchNewsPage = async (pageIndex: number, pageSize: number) => {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const response = await fetch(`${API_BASE_URL}/api/v1/news?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    headers: {
      Accept: '*/*',
      ...(cookieHeader ? { Cookie: cookieHeader } : {})
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.status}`)
  }

  return (await response.json()) as NewsApiResponse
}

export async function fetchNewsList(): Promise<NewsItem[]> {
  const items: NewsItem[] = []
  let pageIndex = 1
  let hasNextPage = false

  do {
    const response = await fetchNewsPage(pageIndex, PAGE_SIZE)
    items.push(...response.value.items.map(mapNewsItem))
    hasNextPage = response.value.hasNextPage
    pageIndex += 1
  } while (hasNextPage)

  return items
}

export async function fetchNewsItemById(id: string): Promise<NewsItem> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const response = await fetch(`${API_BASE_URL}/api/v1/news/${id}`, {
    headers: {
      Accept: '*/*',
      ...(cookieHeader ? { Cookie: cookieHeader } : {})
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch news detail: ${response.status}`)
  }

  const data = (await response.json()) as NewsDetailApiResponse
  return mapNewsItem(data.value)
}

export async function fetchNewsItem(slug: string): Promise<NewsItem> {
  // Nếu là UUID (độ dài 36 ký tự đặc trưng), call thẳng API chi tiết luôn cho nhanh
  if (slug.length === 36 && slug.includes('-')) {
    return fetchNewsItemById(slug)
  }
  
  // Ngược lại nếu là slug chữ, tìm kiếm trong list
  const news = await fetchNewsList()
  const article = news.find((item) => item.slug === slug)

  if (!article) {
    // Thử check xem bản thân slug có phải là ID không
    try {
      return await fetchNewsItemById(slug)
    } catch {
      throw new Error(`News article not found: ${slug}`)
    }
  }

  // Gọi lại API chi tiết để lấy full Content HTML thay vì chỉ lấy summary từ list
  return fetchNewsItemById(article.id)
}

export function formatNewsDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}