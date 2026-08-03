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
import ProductCard from '@/features/products/components/product-card'
import ProductGridEmpty from '@/features/products/components/product-grid-empty'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'
import { PRODUCTS_PAGE_SIZE } from '@/features/products/constants'
import { useGetProducts } from '@/features/products/hooks/use-get-products'
import type { ProductDetail } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { cn, isModifiedClick } from '@/shared/utils'
import { motion, type Variants } from 'motion/react'
import { type CSSProperties, useState } from 'react'

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

/**
 * Windowed page list around the current page: always shows the first and last
 * page, the current page with its immediate neighbors, and an ellipsis where a
 * gap is collapsed (e.g. page 2 of 8 → [1, 2, 3, …, 8]).
 */
function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 1) return [1]

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: Array<number | 'ellipsis'> = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push('ellipsis')
    result.push(p)
    previous = p
  }
  return result
}

export default function ProductGrid({
  categoryIds,
  search = '',
  priceFrom,
  priceTo,
  page,
  onPageChange,
  pageHref,
  pageSize = PRODUCTS_PAGE_SIZE,
  className,
  columnsClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  columnsStyle
}: {
  categoryIds: string[]
  search?: string
  priceFrom?: number
  priceTo?: number
  page: number
  onPageChange: (page: number) => void
  /**
   * Builds a real URL for a given page so the links work as anchors
   * (open-in-new-tab, crawlable) while `onClick` keeps the fast client transition.
   */
  pageHref?: (page: number) => string
  pageSize?: number
  className?: string
  columnsClassName?: string
  columnsStyle?: CSSProperties
}) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  const trimmedSearch = search.trim()

  const {
    products: data,
    isGettingProducts: isLoading,
    isFetchingProducts: isFetching
  } = useGetProducts({
    pageIndex: page,
    pageSize,
    categoryIds,
    search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
    priceFrom,
    priceTo
  })

  const value = data?.value
  const items: ProductDetail[] = value?.items ?? []
  const hasPreviousPage = value?.hasPreviousPage ?? false
  const hasNextPage = value?.hasNextPage ?? false
  const totalCount = value?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageNumbers = getPageNumbers(page, totalPages)
  const hrefFor = (target: number) => (pageHref ? pageHref(target) || '#' : '#')

  const goToPage = (event: React.MouseEvent<HTMLAnchorElement>, target: number) => {
    if (isModifiedClick(event)) return
    event.preventDefault()
    if (isFetching || target < 1 || target > totalPages || target === page) return
    onPageChange(target)
  }

  const handlePreviousPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) return
    event.preventDefault()
    if (!hasPreviousPage || isFetching) return
    onPageChange(page - 1)
  }

  const handleNextPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) return
    event.preventDefault()
    if (!hasNextPage || isFetching) return
    onPageChange(page + 1)
  }

  if (isLoading && items.length === 0) {
    return (
      <div className={cn('min-w-0', className)}>
        <ProductGridSkeleton count={pageSize} columnsClassName={columnsClassName} style={columnsStyle} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={cn('min-w-0', className)}>
        <ProductGridEmpty />
      </div>
    )
  }

  return (
    <div className={cn('min-w-0', className)}>
      <motion.div
        key={items[0]?.id ?? 'empty'}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={cardStagger}
        style={columnsStyle}
        className={cn('grid w-full gap-3 sm:gap-4 lg:gap-5', columnsClassName)}
      >
        {items.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            eager={page === DEFAULT_PAGE_INDEX && index < 4}
            isActive={index === activeIndex}
            onHoverStart={() => setActiveIndex(index)}
          />
        ))}
      </motion.div>

      <Pagination className='mt-8'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={hrefFor(page - 1)}
              text={t('products.grid.previous')}
              aria-disabled={!hasPreviousPage || isFetching}
              className={!hasPreviousPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
              onClick={handlePreviousPage}
            />
          </PaginationItem>
          {pageNumbers.map((entry, index) =>
            entry === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  href={hrefFor(entry)}
                  isActive={entry === page}
                  aria-disabled={isFetching}
                  className={isFetching && entry !== page ? 'pointer-events-none opacity-50' : undefined}
                  onClick={(event) => goToPage(event, entry)}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href={hrefFor(page + 1)}
              text={t('products.grid.next')}
              aria-disabled={!hasNextPage || isFetching}
              className={!hasNextPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
              onClick={handleNextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
