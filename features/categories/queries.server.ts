import 'server-only'

import { CONTENT_LIFE } from '@/lib/cache-life'
import { cacheLife, cacheTag } from 'next/cache'
import categoryService from './services'
import type { CategoryProductPage } from './types'

export const CATEGORIES_CACHE_TAG = 'categories'

export async function getCachedCategories(params: { page?: CategoryProductPage[] } = {}) {
  'use cache'
  cacheTag(CATEGORIES_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  return categoryService.getCategories(params)
}

export async function getCachedCategory(id: string) {
  'use cache'
  cacheTag(CATEGORIES_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  return categoryService.getCategory({ id })
}
