import { cookies } from 'next/headers'
import { type NewsItem } from './news-shared'

export { formatNewsDate, type NewsItem } from './news-shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

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

  let imageUrl = item.pictureUrl || ''

  // BỘ LỌC PHÒNG THỦ: Nếu trường pictureUrl trả về là dữ liệu test dạng "string" hoặc trống
  if (!imageUrl || imageUrl.toLowerCase() === 'string') {
    imageUrl = '' // Xoá sạch để ép giao diện dùng ảnh local fallback
  } 
  // 1. Kiểm tra nếu URL là một link tuyệt đối từ bên ngoài (ví dụ: unsplash)
  else if (imageUrl.startsWith('http')) {
    if (API_BASE_URL && !imageUrl.includes(API_BASE_URL)) {
      imageUrl = '' // Không thuộc hệ thống thì cũng xoá để dùng ảnh local
    }
  } 
  // 2. Nếu là đường dẫn tương đối từ API chuẩn của bạn (ví dụ: /uploads/abc.png)
  else if (API_BASE_URL) {
    // Check thêm trường hợp item.pictureUrl chỉ chứa đúng từ "string" sau dấu gạch chéo
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
    pictureUrl: imageUrl // Đảm bảo luôn trả về URL chuẩn hoặc chuỗi rỗng
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
  if (!slug) {
    throw new Error('Slug hoặc ID tin tức không được để trống')
  }

  if (slug.length === 36 && slug.includes('-')) {
    return fetchNewsItemById(slug)
  }
  
  const news = await fetchNewsList()
  const article = news.find((item) => item.slug === slug)

  if (!article) {
    try {
      return await fetchNewsItemById(slug)
    } catch {
      throw new Error(`News article not found: ${slug}`)
    }
  }

  return fetchNewsItemById(article.id)
}

