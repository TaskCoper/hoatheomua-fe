'use client'

import { dedupeById, resolveLastPageIndex } from '@/features/home/carousel-window'
import { infiniteProductsQuery } from '@/features/products/hooks/use-get-infinite-products'
import type { GetProductsParams } from '@/features/products/hooks/use-get-products'
import { productListQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import type { BasePaginationResponse } from '@/lib/axios'
import { formatVnd } from '@/lib/currency'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

/** One slide's worth of a product - the carousel never touches `ProductDetail` itself. */
export type CarouselFlower = {
  id: string
  label: string
  price: string
  image: string
  href: string
}

type ProductPage = BasePaginationResponse<ProductDetail>

export type InfiniteCarouselFlowers = {
  items: CarouselFlower[]
  /** True once a real page has been read, i.e. the fallback deck is no longer needed. */
  hasLoadedItems: boolean
  isFetchingNextPage: boolean
  isFetchingPreviousPage: boolean
  /** No more pages after the window - the last resident item is the catalog's last. */
  isAtCatalogEnd: boolean
  /** No pages before the window - the first resident item is the catalog's first. */
  isAtCatalogStart: boolean
  /** The whole catalog fits in the window, so wrapping can't skip anything. */
  isWholeCatalogResident: boolean
  firstPageIndex: number
  lastPageIndex: number | null
  loadNextPage: () => void
  loadPreviousPage: () => void
  /** Warm a boundary page so the wrap onto it can be done without a loading state. */
  prefetchPage: (pageIndex: number) => void
  /**
   * Replace the whole window with one already-cached page, synchronously. Returns false
   * when that page is not cached, in which case nothing changes.
   */
  swapWindowToPage: (pageIndex: number) => boolean
}

const toCarouselFlower = (product: ProductDetail): CarouselFlower | null => {
  if (!product.coverImage) return null

  return {
    id: product.id,
    label: product.productName ?? '',
    price: product.price ? `${formatVnd(product.price)}${product.unit ? `/${product.unit}` : ''}` : '',
    image: product.coverImage,
    href: `/products/${product.id}/studio`
  }
}

/**
 * Pagination half of the flowers carousel: a sliding window over the catalog rather
 * than the catalog itself. Only `maxPages` pages are ever resident; walking forward
 * drops the oldest page, walking backward drops the newest, so a category with ten
 * items and one with ten thousand cost the same window.
 */
export const useInfiniteCarouselFlowers = (
  params: (Omit<GetProductsParams, 'pageIndex'> & { maxPages?: number }) | null
): InfiniteCarouselFlowers => {
  const queryClient = useQueryClient()
  // Memoised so the query key keeps its identity - the callbacks below hang off it.
  const options = useMemo(() => infiniteProductsQuery({ ...params, enabled: Boolean(params) }), [params])
  const queryKey = options.queryKey

  const {
    data,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage
  } = useInfiniteQuery(options)

  // Flatten the resident pages, dropping repeats by product id: an offset-paginated API
  // can hand back the same row twice when the catalog shifts between requests, and a
  // duplicate id would break the slide identity everything below depends on.
  const items = useMemo(() => {
    const flowers: CarouselFlower[] = []

    for (const page of data?.pages ?? []) {
      for (const product of page.value.items) {
        const flower = toCarouselFlower(product)
        if (flower) flowers.push(flower)
      }
    }

    return dedupeById(flowers)
  }, [data])

  const pageSize = params?.pageSize ?? 0
  const lastPageIndex = resolveLastPageIndex(data?.pages[0]?.value.totalCount ?? 0, pageSize, DEFAULT_PAGE_INDEX)

  const loadNextPage = useCallback(() => void fetchNextPage(), [fetchNextPage])
  const loadPreviousPage = useCallback(() => void fetchPreviousPage(), [fetchPreviousPage])

  // Boundary pages are warmed on the single-page key, so the swap below is a cache read
  // rather than a request - no empty window, no loading state at the wrap. `maxPages` is
  // a cache-shape knob and must stay out of both the request and the key.
  const listParams = useMemo(() => {
    if (!params) return null
    const { maxPages, ...rest } = params
    void maxPages
    return rest
  }, [params])

  const boundaryPageQuery = useCallback(
    (pageIndex: number) => productListQuery({ ...listParams, pageIndex }),
    [listParams]
  )

  const prefetchPage = useCallback(
    (pageIndex: number) => {
      void queryClient.prefetchQuery(boundaryPageQuery(pageIndex))
    },
    [boundaryPageQuery, queryClient]
  )

  const swapWindowToPage = useCallback(
    (pageIndex: number) => {
      const cached = queryClient.getQueryData<ProductPage>(boundaryPageQuery(pageIndex).queryKey)
      if (!cached) return false

      // One synchronous write: the old window is never visible as an empty or partial
      // state, and no fetch is in flight for the carousel to wait on.
      queryClient.setQueryData(queryKey, { pages: [cached], pageParams: [pageIndex] })
      return true
    },
    [boundaryPageQuery, queryClient, queryKey]
  )

  return {
    items,
    hasLoadedItems: items.length > 0,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isAtCatalogEnd: !hasNextPage,
    isAtCatalogStart: !hasPreviousPage,
    isWholeCatalogResident: !hasNextPage && !hasPreviousPage,
    firstPageIndex: DEFAULT_PAGE_INDEX,
    lastPageIndex,
    loadNextPage,
    loadPreviousPage,
    prefetchPage,
    swapWindowToPage
  }
}
