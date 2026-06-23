import { cookies } from 'next/headers'
import { mapNewsItem, type NewsApiItem, type NewsItem, type NewsPageResult } from './news-shared'

export { formatNewsDate, type NewsItem, type NewsPageResult } from './news-shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

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

export const NEWS_DEFAULT_PAGE_SIZE = 10

const fetchNewsPageRaw = async (pageIndex: number, pageSize: number) => {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const response = await fetch(`${API_BASE_URL}/v1/news?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
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

export async function fetchNewsPage(
  pageIndex: number,
  pageSize: number = NEWS_DEFAULT_PAGE_SIZE
): Promise<NewsPageResult> {
  const response = await fetchNewsPageRaw(pageIndex, pageSize)
  return {
    items: response.value.items.map(mapNewsItem),
    pageIndex: response.value.pageIndex,
    hasNextPage: response.value.hasNextPage,
    totalCount: response.value.totalCount
  }
}

export async function fetchNewsList(): Promise<NewsItem[]> {
  const items: NewsItem[] = []
  let pageIndex = 1
  let hasNextPage = false

  do {
    const response = await fetchNewsPageRaw(pageIndex, NEWS_DEFAULT_PAGE_SIZE)
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

  const response = await fetch(`${API_BASE_URL}/v1/news/${id}`, {
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
