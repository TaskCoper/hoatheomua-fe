/**
 * Deterministic verification for the flowers carousel's sliding window (this repo has no
 * test runner).
 *
 *   node scripts/verify-carousel-window.mjs
 *
 * Part one exercises the pure helpers in `features/home/carousel-window.ts` directly -
 * that module must therefore stay free of runtime imports. Part two runs those same
 * helpers inside a simulator that mirrors the component's state machine over a mocked
 * catalog, including React Query's real `maxPages` trimming (`addToEnd`/`addToStart` in
 * @tanstack/query-core: append drops the first page, prepend drops the last).
 */
import {
  dedupeById,
  detectSeamCrossing,
  MIN_LOOP_SLIDES,
  offsetFromActive,
  padWholeDeck,
  PREFETCH_DISTANCE,
  resolveActiveIndex,
  resolveAnchorIndex,
  resolveLastPageIndex,
  shouldFetchNextPage,
  shouldFetchPreviousPage
} from '../features/home/carousel-window.ts'

let failures = 0
let assertions = 0

const ok = (condition, label, detail) => {
  assertions += 1
  if (condition) return
  failures += 1
  console.error(`  ✗ ${label}\n      ${detail}`)
}

const eq = (actual, expected, label) =>
  ok(actual === expected, label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)

const IDLE = { hasNextPage: true, hasPreviousPage: true, isFetchingNextPage: false, isFetchingPreviousPage: false }

// ---------------------------------------------------------------- pure helpers

console.log('active index survives the window moving')
{
  const windowOf = (from, pages, size) =>
    Array.from({ length: pages * size }, (_, i) => ({ id: `p${from + Math.floor(i / size)}-i${i % size}` }))

  const before = windowOf(4, 5, 20)
  const active = before[95].id
  eq(resolveActiveIndex(before, active), 95, 'index before the window moves')
  eq(resolveActiveIndex(windowOf(5, 5, 20), active), 75, 'forward trim shifts the index by one page')
  eq(resolveActiveIndex(windowOf(3, 6, 20), active), 115, 'a prepended page pushes it right')
  eq(resolveActiveIndex(windowOf(1, 1, 20), active), 0, 'evicted active item falls back to the front')
  eq(resolveActiveIndex([], active), 0, 'empty window')
  eq(resolveActiveIndex(before, null), 0, 'no active item yet')
  eq(resolveAnchorIndex(20, 'last'), 19, 'last anchor')
  eq(resolveAnchorIndex(20, 'first'), 0, 'first anchor')
  eq(resolveAnchorIndex(0, 'last'), 0, 'last anchor on an empty deck')
}

console.log('paging is requested before the edge, on both sides, and never twice at once')
{
  eq(shouldFetchNextPage(94, 100, IDLE), false, 'six from the end: no fetch yet')
  eq(shouldFetchNextPage(95, 100, IDLE), true, 'five from the end: fetch')
  eq(shouldFetchNextPage(99, 100, IDLE), true, 'last slide: fetch')
  eq(shouldFetchPreviousPage(5, IDLE), true, 'five from the front: fetch')
  eq(shouldFetchPreviousPage(6, IDLE), false, 'six from the front: no fetch yet')
  eq(shouldFetchNextPage(15, 20, IDLE), true, 'end of page one asks for page two')
  eq(shouldFetchNextPage(15, 40, IDLE), false, 'page two landed, the same slide no longer asks')

  eq(shouldFetchNextPage(99, 100, { ...IDLE, hasNextPage: false }), false, 'no next page to fetch')
  eq(shouldFetchPreviousPage(0, { ...IDLE, hasPreviousPage: false }), false, 'no previous page to fetch')
  eq(shouldFetchNextPage(99, 100, { ...IDLE, isFetchingNextPage: true }), false, 'already fetching forward')
  eq(shouldFetchNextPage(99, 100, { ...IDLE, isFetchingPreviousPage: true }), false, 'a backward fetch blocks too')
  eq(shouldFetchPreviousPage(0, { ...IDLE, isFetchingPreviousPage: true }), false, 'already fetching backward')
  eq(shouldFetchPreviousPage(0, { ...IDLE, isFetchingNextPage: true }), false, 'a forward fetch blocks too')
}

console.log('seam crossings are only single steps over the wrap')
{
  eq(detectSeamCrossing(99, 0, 100), 'forward', 'last to first')
  eq(detectSeamCrossing(0, 99, 100), 'backward', 'first to last')
  eq(detectSeamCrossing(50, 51, 100), null, 'an ordinary step')
  eq(detectSeamCrossing(20, 0, 100), null, 'a click back to the front is not a wrap')
  eq(detectSeamCrossing(0, 0, 1), null, 'a single slide cannot wrap')
}

console.log('offsets wrap only when the deck loops')
{
  eq(offsetFromActive(5, 0, 6, true), -1, 'last slide is the looping deck previous neighbour')
  eq(offsetFromActive(0, 5, 6, true), 1, 'wrapping forward over the seam')
  eq(offsetFromActive(5, 0, 6, false), 5, 'no wrap when the deck does not loop')
}

console.log('flattening drops repeats and a whole small deck is padded')
{
  const overlapping = [{ id: 'a' }, { id: 'b' }, { id: 'b' }, { id: 'c' }, { id: 'a' }]
  eq(
    dedupeById(overlapping)
      .map((s) => s.id)
      .join(','),
    'a,b,c',
    'first occurrence of each id wins'
  )

  const padded = padWholeDeck([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
  ok(padded.length >= MIN_LOOP_SLIDES, 'padded to embla’s minimum', `got ${padded.length}`)
  eq(new Set(padded.map((s) => s.id)).size, padded.length, 'padded copies keep distinct ids')
  eq(padWholeDeck(Array.from({ length: 9 }, (_, i) => ({ id: `n${i}` }))).length, 9, 'a looping deck is left alone')
  eq(resolveLastPageIndex(200, 20, 1), 10, 'last page index of a 200 row catalog')
  eq(resolveLastPageIndex(0, 20, 1), null, 'unknown total')
}

// ------------------------------------------------- simulated carousel over 10 pages

const TOTAL_PAGES = 10
const PAGE_SIZE = 20
const MAX_PAGES = 5
const TOTAL_COUNT = TOTAL_PAGES * PAGE_SIZE

const catalogPage = (pageIndex) => ({
  items: Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: `p${pageIndex}-i${i}` })),
  pageIndex,
  totalCount: TOTAL_COUNT
})

// @tanstack/query-core utils.js
const addToEnd = (items, item, max) => {
  const next = [...items, item]
  return max && next.length > max ? next.slice(1) : next
}
const addToStart = (items, item, max) => {
  const next = [item, ...items]
  return max && next.length > max ? next.slice(0, -1) : next
}

/** Mirrors the component: embla index + id anchor, the two effects, and the seam handler. */
class CarouselSim {
  constructor({ startPage = 1, boundaryCache = new Set() } = {}) {
    this.pageParams = [startPage]
    this.pages = [catalogPage(startPage)]
    this.boundaryCache = boundaryCache
    this.fetchInFlight = null
    this.fetchCalls = []
    this.activeItemId = this.slides[0].id
    this.emblaIndex = 0
    this.visited = [this.activeItemId]
  }

  get slides() {
    return dedupeById(this.pages.flatMap((page) => page.items))
  }
  get paging() {
    return {
      hasNextPage: this.pageParams.at(-1) < TOTAL_PAGES,
      hasPreviousPage: this.pageParams[0] > 1,
      isFetchingNextPage: this.fetchInFlight === 'forward',
      isFetchingPreviousPage: this.fetchInFlight === 'backward'
    }
  }
  get lastPageIndex() {
    return resolveLastPageIndex(this.pages[0].totalCount, PAGE_SIZE, 1)
  }

  /** The re-anchor layout effect: re-derive the index of the same flower, or the anchor. */
  reAnchor(anchor = null) {
    const slides = this.slides
    this.emblaIndex = anchor ? resolveAnchorIndex(slides.length, anchor) : resolveActiveIndex(slides, this.activeItemId)
    this.activeItemId = slides[this.emblaIndex].id
  }

  /** The seam handler: swap the window onto an already-cached boundary page. */
  handleSeam(direction) {
    const boundaryPage = direction === 'forward' ? 1 : this.lastPageIndex
    const alreadyResident = direction === 'forward' ? !this.paging.hasPreviousPage : !this.paging.hasNextPage
    if (alreadyResident || boundaryPage === null) return

    if (!this.boundaryCache.has(boundaryPage)) {
      this.boundaryCache.add(boundaryPage) // the prefetch the component fires instead
      return
    }

    this.pages = [catalogPage(boundaryPage)]
    this.pageParams = [boundaryPage]
    this.reAnchor(direction === 'forward' ? 'first' : 'last')
  }

  /** The paging effect. `defer` models the request being in flight rather than instant. */
  runPagingEffect({ defer = false, fail = false } = {}) {
    const slides = this.slides
    if (shouldFetchNextPage(this.emblaIndex, slides.length, this.paging)) {
      this.fetchCalls.push({ direction: 'forward', atIndex: this.emblaIndex })
      if (defer) return (this.fetchInFlight = 'forward')
      if (fail) return
      this.pages = addToEnd(this.pages, catalogPage(this.pageParams.at(-1) + 1), MAX_PAGES)
      this.pageParams = addToEnd(this.pageParams, this.pageParams.at(-1) + 1, MAX_PAGES)
      this.reAnchor()
    } else if (shouldFetchPreviousPage(this.emblaIndex, this.paging)) {
      this.fetchCalls.push({ direction: 'backward', atIndex: this.emblaIndex })
      if (defer) return (this.fetchInFlight = 'backward')
      if (fail) return
      this.pages = addToStart(this.pages, catalogPage(this.pageParams[0] - 1), MAX_PAGES)
      this.pageParams = addToStart(this.pageParams, this.pageParams[0] - 1, MAX_PAGES)
      this.reAnchor()
    }
  }

  /** One autoplay tick (or one swipe), forward or backward. */
  step(direction = 'forward', options = {}) {
    const slides = this.slides
    const previousIndex = this.emblaIndex
    this.emblaIndex =
      direction === 'forward'
        ? (previousIndex + 1) % slides.length
        : (previousIndex - 1 + slides.length) % slides.length
    this.activeItemId = slides[this.emblaIndex].id

    const crossing = detectSeamCrossing(previousIndex, this.emblaIndex, slides.length)
    if (crossing) this.handleSeam(crossing)

    this.runPagingEffect(options)
    this.visited.push(this.activeItemId)
    return this.activeItemId
  }
}

console.log('a full autoplay walk of 10 pages visits every product exactly once, in order')
{
  const sim = new CarouselSim()
  const expected = []
  for (let page = 1; page <= TOTAL_PAGES; page += 1) {
    for (let i = 0; i < PAGE_SIZE; i += 1) expected.push(`p${page}-i${i}`)
  }

  for (let tick = 0; tick < TOTAL_COUNT - 1; tick += 1) sim.step()

  eq(sim.visited.length, TOTAL_COUNT, 'one visit per catalog row')
  const firstMismatch = sim.visited.findIndex((id, i) => id !== expected[i])
  eq(firstMismatch, -1, 'no item skipped, repeated or reordered across appends and trims')
  eq(sim.pageParams.join(','), '6,7,8,9,10', 'the window has slid to the last five pages')
  eq(sim.slides.length, MAX_PAGES * PAGE_SIZE, 'never more than five pages resident')
  eq(sim.activeItemId, `p${TOTAL_PAGES}-i${PAGE_SIZE - 1}`, 'ends on the catalog’s final product')

  // Identity is preserved across every window mutation: re-deriving the active index in
  // the final window must still find the same flower.
  eq(resolveActiveIndex(sim.slides, sim.activeItemId), 99, 'final product sits at the window’s end')
}

console.log('forward and backward fetches start at the expected thresholds')
{
  const sim = new CarouselSim()
  while (sim.fetchCalls.length === 0) sim.step()
  eq(sim.fetchCalls[0].direction, 'forward', 'first fetch is forward')
  eq(sim.fetchCalls[0].atIndex, PAGE_SIZE - PREFETCH_DISTANCE, 'requested five slides before the end of page one')

  // Start mid-catalog so there is a previous page to ask for, and walk to the front.
  const back = new CarouselSim({ startPage: 1 })
  for (let i = 0; i < 120; i += 1) back.step()
  ok(back.pageParams[0] > 1, 'window has left page one', `pageParams ${back.pageParams}`)
  back.fetchCalls.length = 0
  while (back.emblaIndex > PREFETCH_DISTANCE) back.step('backward')
  back.step('backward')
  const backward = back.fetchCalls.find((call) => call.direction === 'backward')
  ok(backward, 'a backward fetch was requested', 'none seen')
  ok(
    backward && backward.atIndex <= PREFETCH_DISTANCE,
    'requested within five slides of the front',
    `${backward?.atIndex}`
  )
}

console.log('the active product survives a prepend trim')
{
  const sim = new CarouselSim()
  for (let i = 0; i < 120; i += 1) sim.step()
  while (sim.emblaIndex > PREFETCH_DISTANCE + 1) sim.step('backward')

  const before = sim.activeItemId
  const pagesBefore = sim.pageParams.join(',')
  sim.step('backward')
  ok(
    sim.pageParams.join(',') !== pagesBefore,
    'a page was prepended and the last one trimmed',
    sim.pageParams.join(',')
  )
  eq(sim.slides[sim.emblaIndex].id, sim.activeItemId, 'embla index and the anchor agree after the prepend')
  ok(sim.activeItemId !== before, 'stepping backward did move one item', 'unchanged')
  eq(sim.visited.at(-1), sim.activeItemId, 'the visited item is the one now centred')
}

console.log('no second fetch is issued while one is in flight')
{
  const sim = new CarouselSim()
  while (sim.fetchCalls.length === 0) sim.step({ defer: true })
  const callsAfterFirst = sim.fetchCalls.length
  sim.step({ defer: true })
  sim.step({ defer: true })
  eq(sim.fetchCalls.length, callsAfterFirst, 'further ticks do not re-request while fetching')
}

console.log('a failed fetch leaves the current product and the window intact')
{
  const sim = new CarouselSim()
  while (sim.emblaIndex < PAGE_SIZE - PREFETCH_DISTANCE - 1) sim.step()
  const before = { id: sim.activeItemId, pages: sim.pageParams.join(','), count: sim.slides.length }

  sim.step({ fail: true })
  eq(sim.pageParams.join(','), before.pages, 'the window is unchanged after a failed fetch')
  eq(sim.slides.length, before.count, 'no slides lost')
  eq(sim.slides[sim.emblaIndex].id, sim.activeItemId, 'the centred slide still resolves')
  ok(sim.activeItemId !== before.id, 'the carousel still advanced', 'stuck')
}

console.log('wrapping at the catalog ends lands on the real first / final product')
{
  // Walk to the very last product, page one long since evicted.
  const sim = new CarouselSim()
  for (let tick = 0; tick < TOTAL_COUNT - 1; tick += 1) sim.step()
  eq(sim.activeItemId, 'p10-i19', 'standing on the final product')
  eq(sim.paging.hasPreviousPage, true, 'page one is no longer resident')

  // First crossing with a cold cache: the deck loops inside the window and warms page one.
  sim.step()
  eq(sim.boundaryCache.has(1), true, 'page one was warmed for the next crossing')
  ok(sim.activeItemId !== 'p1-i0', 'a cold cache does not swap', sim.activeItemId)

  // Walk back round to the end; now the swap is a cache read.
  while (sim.activeItemId !== 'p10-i19') sim.step()
  sim.step()
  eq(sim.activeItemId, 'p1-i0', 'wrapping past the end lands on the catalog’s first product')
  eq(sim.pageParams.join(','), '1', 'the window was swapped onto page one')
  eq(sim.emblaIndex, 0, 'and anchored at its first slide')
}

console.log('wrapping backward from the first product lands on the real final product')
{
  const sim = new CarouselSim({ boundaryCache: new Set([TOTAL_PAGES]) })
  eq(sim.activeItemId, 'p1-i0', 'standing on the first product')
  sim.step('backward')
  eq(sim.activeItemId, `p${TOTAL_PAGES}-i${PAGE_SIZE - 1}`, 'wrapped onto the catalog’s final product')
  eq(sim.pageParams.join(','), String(TOTAL_PAGES), 'the window was swapped onto the last page')
  eq(sim.emblaIndex, PAGE_SIZE - 1, 'and anchored at its last slide')
}

console.log('')
if (failures > 0) {
  console.error(`${failures} of ${assertions} assertions failed`)
  process.exit(1)
}
console.log(`${assertions} assertions passed`)
