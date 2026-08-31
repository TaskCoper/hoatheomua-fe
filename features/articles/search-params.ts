import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { createLoader, parseAsInteger } from 'nuqs/server'

export const NEWS_CURATED_PAGE_SIZE = 4
export const NEWS_OTHER_STORIES_PAGE_SIZE = 8

export const newsSearchParsers = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX)
}

export const loadNewsSearch = createLoader(newsSearchParsers)
