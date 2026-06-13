'use client'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { getColumns } from '@/features/news/components/new-columns'
import { useGetNews } from '@/features/news/hooks/use-get-news'
import { NewRow } from '@/features/news/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'

export default function NewsPage() {
  const { t } = useTranslation()
  const columns = useMemo(() => getColumns(t), [t])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'news'
  })

  const [nameFilter] = useQueryState('news_name', parseAsString)

  const name = nameFilter ?? undefined

  const { news, isGettingNews } = useGetNews({
    pageIndex: page,
    pageSize: limit,
    keyword: name
  })

  const { table } = useDataTable({
    data: news.value.items,
    columns,
    pageCount: Math.ceil(news.value.totalCount / limit),
    initialState: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit
      },
      sorting: sorting ? (sorting as ExtendedColumnSort<NewRow>[]) : undefined
    },
    getRowId: (row) => row.id.toString()
  })

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div>
        <p className='text-xl font-semibold'>{t('admin.news.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('admin.news.description')}</p>
      </div>

      <DataTableToolbar table={table} />

      <DataTable table={table} isLoading={isGettingNews} />
    </div>
  )
}
