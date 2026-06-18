'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { buildGetProductsKey } from '@/features/products/hooks/use-get-products'
import productService from '@/features/products/services'
import type { Product } from '@/features/products/types'
import type { BaseResponse } from '@/lib/axios'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'
import ProductCard from './product-card'
import ProductGridEmpty from './product-grid-empty'
import ProductGridSkeleton from './product-grid-skeleton'

type ProductListResponse = BaseResponse<{
  code: number
  data: Product[]
  paginator: { next: { id: number } }
}>

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const PRODUCTS_PAGE_SIZE = 12

export default function ProductGrid({
  initialItems,
  initialNextCursor,
  pageSize = PRODUCTS_PAGE_SIZE
}: {
  initialItems: Product[]
  initialNextCursor: number
  pageSize?: number
}) {
  const [cursorStack, setCursorStack] = useState([0])
  const currentCursor = cursorStack.at(-1) ?? 0
  const isFirstPage = currentCursor === 0

  const { data, isFetching, isLoading } = useQuery<ProductListResponse>({
    queryKey: buildGetProductsKey({ size: pageSize, next: { id: currentCursor } }),
    queryFn: () => productService.getProducts({ size: pageSize, next: { id: currentCursor } }),
    placeholderData: keepPreviousData,
    initialData: isFirstPage
      ? ({
          isSuccess: true,
          isFailed: false,
          error: null,
          traceId: '',
          timestampUtc: '',
          value: {
            code: 0,
            data: initialItems,
            paginator: { next: { id: initialNextCursor } }
          }
        } as ProductListResponse)
      : undefined,
    staleTime: isFirstPage ? 60_000 : 0
  })

  const items = data?.value?.data ?? []
  const nextCursor = data?.value?.paginator.next.id ?? 0
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
        initial='hidden'
        animate='visible'
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5'
      >
        {items.map((product, index) => (
          <ProductCard key={product.id} product={product} eager={isFirstPage && index < 4} />
        ))}
      </motion.div>

      <Pagination className='mt-8'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#all-products'
              text='Trước'
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
              text='Sau'
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
