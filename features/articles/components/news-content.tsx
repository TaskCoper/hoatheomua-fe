'use client'

import NewsView from '@/features/articles/components/news-view'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { useQueryStates } from 'nuqs'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { newsSearchParsers } from '../search-params'

type SetPage = (page: number) => void

function NewsSearchParamsSync({ onSync }: { onSync: (pageIndex: number, setPage: SetPage) => void }) {
  const [{ page }, setSearch] = useQueryStates(newsSearchParsers)

  const setPage = useCallback<SetPage>((next) => setSearch({ page: next }), [setSearch])

  useEffect(() => {
    onSync(page, setPage)
  }, [onSync, page, setPage])

  return null
}

export default function NewsContent({ locale }: { locale: string }) {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX)
  const setPageRef = useRef<SetPage | null>(null)

  const handleSync = useCallback((nextPageIndex: number, setPage: SetPage) => {
    setPageRef.current = setPage
    setPageIndex(nextPageIndex)
  }, [])

  const handlePageChange = useCallback<SetPage>((next) => {
    setPageRef.current?.(next)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <NewsSearchParamsSync onSync={handleSync} />
      </Suspense>

      <NewsView locale={locale} pageIndex={pageIndex} onPageChange={handlePageChange} />
    </>
  )
}
