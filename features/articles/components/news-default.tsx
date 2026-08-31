'use client'

import NewsView from '@/features/articles/components/news-view'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'

const noop = () => {}

export default function NewsDefault({
  locale,
  pageIndex = DEFAULT_PAGE_INDEX
}: {
  locale: string
  pageIndex?: number
}) {
  return <NewsView locale={locale} pageIndex={pageIndex} onPageChange={noop} />
}
