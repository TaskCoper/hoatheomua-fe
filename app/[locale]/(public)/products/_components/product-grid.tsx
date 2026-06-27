'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import { useGetProducts } from '@/features/products/hooks/use-get-products'
import type { Product } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'
import ProductCard from './product-card'
import ProductGridEmpty from './product-grid-empty'
import ProductGridSkeleton from './product-grid-skeleton'

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const PRODUCTS_PAGE_SIZE = 12

export default function ProductGrid({
  categoryIds,
  name = '',
  price,
  pageSize = PRODUCTS_PAGE_SIZE
}: {
  categoryIds: number[]
  name?: string
  price?: number[]
  pageSize?: number
}) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [cursorStack, setCursorStack] = useState([0])
  const currentCursor = cursorStack.at(-1) ?? 0
  const isFirstPage = currentCursor === 0
  const nextParam = isFirstPage ? undefined : { id: currentCursor }

  const {
    products: data,
    isFetchingProducts: isFetching,
    isLoadingProducts: isLoading
  } = useGetProducts({
    size: pageSize,
    categoryIds,
    name,
    price,
    sort: DEFAULT_PRODUCT_SORT,
    next: nextParam
  })

  const items = (data?.value?.data ?? []) as Product[]
  const nextCursor = data?.value?.paginator?.next?.id ?? 0
  const hasPreviousPage = cursorStack.length > 1
  const hasNextPage = items.length === pageSize && nextCursor > 0 && nextCursor !== currentCursor

  const handlePreviousPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasPreviousPage || isFetching) return
    setCursorStack((previous) => previous.slice(0, -1))
  }

  const handleNextPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasNextPage || isFetching) return
    setCursorStack((previous) => [...previous, nextCursor])
  }

  if (isLoading && items.length === 0) {
    return <ProductGridSkeleton count={pageSize} />
  }

  if (items.length === 0) {
    return <ProductGridEmpty />
  }

  return (
    <>
      <motion.div
        key={items[0]?.id ?? 'empty'}
        initial='hidden'
        animate='visible'
        variants={cardStagger}
        className='mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5'
      >
        {items.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            eager={isFirstPage && index < 4}
            isActive={index === activeIndex}
            onHoverStart={() => setActiveIndex(index)}
          />
        ))}
      </motion.div>

      <Pagination className='mt-8'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#all-products'
              text={t('products.grid.previous')}
              aria-disabled={!hasPreviousPage || isFetching}
              className={!hasPreviousPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
              onClick={handlePreviousPage}
            />
          </PaginationItem>
          <PaginationItem>
            <span className='flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground'>
              {cursorStack.length}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href='#all-products'
              text={t('products.grid.next')}
              aria-disabled={!hasNextPage || isFetching}
              className={!hasNextPage || isFetching ? 'pointer-events-none opacity-50' : undefined}
              onClick={handleNextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
