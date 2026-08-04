import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { createLoader, parseAsInteger } from 'nuqs/server'

export const newsSearchParsers = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX)
}

// test
export const loadNewsSearch = createLoader(newsSearchParsers)
