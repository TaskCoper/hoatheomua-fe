'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

/**
 * Sliding-window page list: anchors page 1 and the last page, and shows
 * `current ± 1` with ellipses where there's a gap. Totals ≤ 7 render every
 * page.
 */
const buildPageList = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

interface ArticlePaginationProps {
  pageIndex: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFetching: boolean
  onPageChange: (page: number) => void
  /** In-page anchor for the `href` (so right-click/middle-click still scrolls). */
  scrollAnchor?: string
  className?: string
}

export function ArticlePagination({
  pageIndex,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isFetching,
  onPageChange,
  scrollAnchor,
  className = 'mt-8'
}: ArticlePaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  const pageList = buildPageList(pageIndex, totalPages)
  const href = scrollAnchor ?? '#'

  const goTo = (next: number) => {
    if (isFetching || next === pageIndex || next < 1 || next > totalPages) return
    onPageChange(next)
  }

  const handlePrevious = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasPreviousPage) return
    goTo(pageIndex - 1)
  }

  const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasNextPage) return
    goTo(pageIndex + 1)
  }

  const handlePageClick = (page: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    goTo(page)
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={href}
            text={t('products.grid.previous')}
            aria-disabled={!hasPreviousPage || isFetching}
            className={!hasPreviousPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
            onClick={handlePrevious}
          />
        </PaginationItem>

        {pageList.map((entry, index) =>
          entry === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={href}
                isActive={entry === pageIndex}
                aria-disabled={isFetching}
                className={
                  isFetching && entry !== pageIndex
                    ? 'pointer-events-none opacity-50'
                    : entry === pageIndex
                      ? 'pointer-events-none bg-primary text-primary-foreground'
                      : undefined
                }
                onClick={handlePageClick(entry)}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={href}
            text={t('products.grid.next')}
            aria-disabled={!hasNextPage || isFetching}
            className={!hasNextPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
            onClick={handleNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
