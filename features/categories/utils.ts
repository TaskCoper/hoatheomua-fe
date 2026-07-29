import type { Locale } from '@/lib/i18n/routing'
import type { CSSProperties } from 'react'
import type { CategoryMetadata, SortableCategory } from './types'

/** Grid fallbacks when `rows`/`cols` are absent or invalid: 1 row × 4 columns. */
export const DEFAULT_CATEGORY_ROWS = 1
export const DEFAULT_CATEGORY_COLS = 4

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

/** Coerce a metadata dimension to a positive integer, falling back when absent/invalid. */
const toGridDimension = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback

/**
 * Resolve a category's grid from its metadata. `rows` and `cols` default
 * independently to 1×4, and the page limit is simply `rows × cols` — so a section
 * with no (or partial) grid config lists 4 products per page in a single row.
 */
export const getCategoryGrid = (meta: CategoryMetadata): { rows: number; cols: number; pageSize: number } => {
  const rows = toGridDimension(meta.rows, DEFAULT_CATEGORY_ROWS)
  const cols = toGridDimension(meta.cols, DEFAULT_CATEGORY_COLS)
  return { rows, cols, pageSize: rows * cols }
}

/**
 * Responsive `grid-template-columns` for an arbitrary column count. The target
 * count is fed through CSS variables so Tailwind's JIT never sees a dynamic class
 * name, and the count ramps up across breakpoints (1 → 2 → 3 → target) so any
 * configured value still reads well on smaller screens.
 */
export const getResponsiveGridColumns = (cols: number): { className: string; style: CSSProperties } => {
  const target = Math.max(1, Math.floor(cols))
  const track = (n: number) => `repeat(${n},minmax(0,1fr))`
  return {
    className:
      'grid-cols-1 sm:[grid-template-columns:var(--grid-cols-sm)] md:[grid-template-columns:var(--grid-cols-md)] lg:[grid-template-columns:var(--grid-cols-lg)]',
    style: {
      '--grid-cols-sm': track(Math.min(target, 2)),
      '--grid-cols-md': track(Math.min(target, 3)),
      '--grid-cols-lg': track(target)
    } as CSSProperties
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
