import type { Locale } from '@/lib/i18n/routing'
import type { CategoryMetadata, SortableCategory } from './types'

/**
 * `metaData` arrives as a raw JSON string (or null). Parse it defensively into
 * the `CategoryMetadata` contract, falling back to an empty object so a bad/absent
 * payload simply yields no filter flags rather than throwing.
 */
export const parseCategoryMetadata = (metaData: string | null): CategoryMetadata => {
  if (!metaData) return {}

  try {
    const parsed = JSON.parse(metaData)
    return parsed && typeof parsed === 'object' ? (parsed as CategoryMetadata) : {}
  } catch {
    return {}
  }
}

/** Localized display name for a category. `SortableCategory` uses `nameEn`; fall back to `name` (vi). */
export const getCategoryName = (category: Pick<SortableCategory, 'name' | 'nameEn'>, locale: Locale): string =>
  locale === 'en' ? (category.nameEn ?? category.name) : category.name

/** Localized description for a category. `SortableCategory` uses `descriptionEn`; fall back to `description` (vi). */
export const getCategoryDescription = (
  category: Pick<SortableCategory, 'description' | 'descriptionEn'>,
  locale: Locale
): string | null => (locale === 'en' ? (category.descriptionEn ?? category.description) : category.description)
