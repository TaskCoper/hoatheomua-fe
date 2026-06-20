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

export function formatNewsDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}
