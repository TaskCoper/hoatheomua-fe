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
import { useWomenDayProducts } from '@/features/women-day-20-10/hooks/use-women-day-products'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 1) return [1]

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const result: Array<number | 'ellipsis'> = []
  let previous = 0

  for (const page of sorted) {
    if (previous && page - previous > 1) result.push('ellipsis')
    result.push(page)
    previous = page
  }

  return result
}

export default function WomenDayProductsSection() {
  const { t } = useTranslation()
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX)
  const [activeIndex, setActiveIndex] = useState(0)
  const { products, isGettingProducts, isFetchingProducts } = useWomenDayProducts(page)
  const value = products?.value
  const items = value?.items ?? []
  const totalPages = Math.max(1, Math.ceil((value?.totalCount ?? 0) / (value?.pageSize ?? 4)))
  const pageNumbers = getPageNumbers(page, totalPages)
  const hasPreviousPage = value?.hasPreviousPage ?? page > 1
  const hasNextPage = value?.hasNextPage ?? page < totalPages

  if (isGettingProducts && items.length === 0) {
    return <ProductGridSkeleton count={4} columnsClassName='[grid-template-columns:repeat(auto-fill,minmax(min(9rem,100%),1fr))] sm:grid-cols-2 lg:grid-cols-4' />
  }

  if (items.length === 0) {
    return <ProductGridEmpty />
  }

  const goToPage = (nextPage: number) => {
    if (isFetchingProducts || nextPage < 1 || nextPage > totalPages || nextPage === page) return
    setActiveIndex(0)
    setPage(nextPage)
  }

  return (
    <>
      <motion.div
        key={`${page}-${items[0]?.id ?? 'empty'}`}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={cardStagger}
        className='grid w-full gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(9rem,100%),1fr))] sm:grid-cols-2 lg:grid-cols-4 lg:gap-5'
      >
        {items.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            eager={page === DEFAULT_PAGE_INDEX && index < 4}
            isActive={index === activeIndex}
            onHoverStart={() => setActiveIndex(index)}
            singleLineTitle
          />
        ))}
      </motion.div>

      <Pagination className='mt-8'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#collection'
              text={t('products.grid.previous')}
              aria-disabled={!hasPreviousPage || isFetchingProducts}
              className={!hasPreviousPage || isFetchingProducts ? 'pointer-events-none opacity-50' : undefined}
              onClick={(event) => {
                event.preventDefault()
                goToPage(page - 1)
              }}
            />
          </PaginationItem>
          <PaginationItem className='sm:hidden'>
            <span className='px-3 text-xs font-medium text-muted-foreground tabular-nums'>
              {t('products.grid.page', { page, total: totalPages })}
            </span>
          </PaginationItem>
          {pageNumbers.map((entry, index) =>
            entry === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`} className='hidden sm:block'>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry} className='hidden sm:block'>
                <PaginationLink
                  href='#collection'
                  isActive={entry === page}
                  aria-disabled={isFetchingProducts}
                  className={isFetchingProducts && entry !== page ? 'pointer-events-none opacity-50' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    goToPage(entry)
                  }}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href='#collection'
              text={t('products.grid.next')}
              aria-disabled={!hasNextPage || isFetchingProducts}
              className={!hasNextPage || isFetchingProducts ? 'pointer-events-none opacity-50' : undefined}
              onClick={(event) => {
                event.preventDefault()
                goToPage(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
