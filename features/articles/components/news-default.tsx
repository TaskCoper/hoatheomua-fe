'use client'

import NewsView from '@/features/articles/components/news-view'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'

const noop = () => {}

export default function NewsDefault({ locale }: { locale: string }) {
  return <NewsView locale={locale} pageIndex={DEFAULT_PAGE_INDEX} onPageChange={noop} />
}
