import 'server-only'

import { unstable_cache } from 'next/cache'
import categoryService from './services'
import type { CategoryProductPage } from './types'

export const CATEGORIES_CACHE_TAG = 'categories'

export const getCachedCategories = (params: { page?: CategoryProductPage[] } = {}) =>
  unstable_cache(() => categoryService.getCategories(params), ['categories-with-children', JSON.stringify(params)], {
    tags: [CATEGORIES_CACHE_TAG],
    revalidate: 3600
  })()
