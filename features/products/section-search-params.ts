import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs'

/**
 * Per-section filter state. Each category-driven section shares this parser set
 * but namespaces its URL params by category id (see `buildSectionUrlKeys`) so
 * multiple sections coexist on one page without colliding.
 */
export const sectionSearchParsers = {
  q: parseAsString.withDefault(''),
  pmin: parseAsInteger,
  pmax: parseAsInteger,
  cats: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX)
}

export const buildSectionUrlKeys = (categoryId: string) => ({
  q: `${categoryId}_q`,
  pmin: `${categoryId}_pmin`,
  pmax: `${categoryId}_pmax`,
  cats: `${categoryId}_cats`,
  page: `${categoryId}_page`
})
