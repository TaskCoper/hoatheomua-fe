'use client'

import NewsView from '@/features/articles/components/news-view'
import { useQueryStates } from 'nuqs'
import { newsSearchParsers } from '../search-params'

export default function NewsContent({ locale }: { locale: string }) {
  const [{ page: pageIndex }, setSearch] = useQueryStates(newsSearchParsers)

  return <NewsView locale={locale} pageIndex={pageIndex} onPageChange={(next) => setSearch({ page: next })} />
}
