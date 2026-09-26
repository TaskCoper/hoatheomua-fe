/**
 * Pure window maths for the flowers carousel. Kept out of the component because this is
 * where a sliding cache window bites: pages are trimmed off the front, so a position
 * held as a plain index silently becomes a different flower. Verified by
 * `scripts/verify-carousel-window.mjs`, which is why this file must stay free of runtime
 * imports.
 */

export type WindowSlide = { id: string }

/** How close to either end of the resident window the active slide may get before paging. */
export const PREFETCH_DISTANCE = 5

/** Below this, embla refuses to loop at all. */
export const MIN_LOOP_SLIDES = 5

/** Where the re-anchor should land after the window is swapped at a catalog boundary. */
export type WindowAnchor = 'first' | 'last'

export type PagingState = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFetchingNextPage: boolean
  isFetchingPreviousPage: boolean
}

/**
 * The active item's index in the *current* window, or 0 when it is no longer resident
 * (the deck was replaced wholesale - a boundary swap, or the fallback swapped for real
 * data).
 */
export const resolveActiveIndex = <Slide extends WindowSlide>(
  slides: readonly Slide[],
  activeItemId: string | null
): number => {
  const index = slides.findIndex((slide) => slide.id === activeItemId)
  return index >= 0 ? index : 0
}

export const resolveAnchorIndex = (slideCount: number, anchor: WindowAnchor): number =>
  anchor === 'last' ? Math.max(slideCount - 1, 0) : 0

/**
 * Signed distance from the active slide, wrapped when the deck loops so the slides
 * either side of the seam are still treated as neighbours.
 */
export const offsetFromActive = (index: number, activeIndex: number, slideCount: number, canLoop: boolean): number => {
  const raw = index - activeIndex
  if (!canLoop || slideCount === 0) return raw
  if (raw > slideCount / 2) return raw - slideCount
  if (raw < -slideCount / 2) return raw + slideCount
  return raw
}

/**
 * Single decision point for paging, so "near the edge" and "not already fetching" can
 * never drift apart between the component and the query hook. A fetch in *either*
 * direction blocks both: they trim opposite ends of the same window.
 */
export const shouldFetchNextPage = (activeIndex: number, slideCount: number, paging: PagingState): boolean => {
  if (!paging.hasNextPage) return false
  if (paging.isFetchingNextPage || paging.isFetchingPreviousPage) return false
  return activeIndex >= slideCount - PREFETCH_DISTANCE
}

export const shouldFetchPreviousPage = (activeIndex: number, paging: PagingState): boolean => {
  if (!paging.hasPreviousPage) return false
  if (paging.isFetchingNextPage || paging.isFetchingPreviousPage) return false
  return activeIndex <= PREFETCH_DISTANCE
}

/**
 * Which way the deck wrapped, read from the snap embla came from. Anything that is not a
 * single step across the seam - a click, a re-anchor - is not a wrap.
 */
export const detectSeamCrossing = (
  previousIndex: number,
  currentIndex: number,
  slideCount: number
): 'forward' | 'backward' | null => {
  if (slideCount < 2) return null
  if (previousIndex === slideCount - 1 && currentIndex === 0) return 'forward'
  if (previousIndex === 0 && currentIndex === slideCount - 1) return 'backward'
  return null
}

/** First occurrence wins: offset paging can repeat a row when the catalog shifts. */
export const dedupeById = <Slide extends WindowSlide>(slides: readonly Slide[]): Slide[] => {
  const seen = new Set<string>()
  const unique: Slide[] = []

  for (const slide of slides) {
    if (seen.has(slide.id)) continue
    seen.add(slide.id)
    unique.push(slide)
  }

  return unique
}

/**
 * Embla needs a handful of slides before it will loop. This only ever runs on a deck that
 * is entirely resident (a category smaller than one page), so it pads a complete list
 * rather than faking a loop over a paginated one - and the copies keep distinct ids so
 * slide identity still holds.
 */
export const padWholeDeck = <Slide extends WindowSlide>(slides: readonly Slide[]): Slide[] => {
  if (slides.length === 0 || slides.length >= MIN_LOOP_SLIDES) return [...slides]

  const padded: Slide[] = []
  while (padded.length < MIN_LOOP_SLIDES) {
    for (const slide of slides) {
      padded.push({ ...slide, id: `${slide.id}__${padded.length}` })
    }
  }

  return padded
}

/** Page index of the catalog's final page, or null while the total is unknown. */
export const resolveLastPageIndex = (totalCount: number, pageSize: number, firstPageIndex: number): number | null => {
  if (totalCount <= 0 || pageSize <= 0) return null
  return firstPageIndex + Math.ceil(totalCount / pageSize) - 1
}
