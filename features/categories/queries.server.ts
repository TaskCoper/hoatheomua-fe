import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import { cacheLife, cacheTag } from 'next/cache'
import categoryService from './services'
import type { CategoryProductPage } from './types'

export const CATEGORIES_CACHE_TAG = 'categories'

export async function getCachedCategories(params: { page?: CategoryProductPage[] } = {}) {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag(CATEGORIES_CACHE_TAG)

  return categoryService.getCategories(params)
}
