import type { Page, Request } from '@playwright/test'

/**
 * The application endpoints the create-order suite watches.
 *
 * They were spelled out inline in ~30 places as `new URL(request.url()).pathname === '...'`.
 * One typo in one of those predicates makes a counter silently stay at 0 and every assertion
 * built on it vacuous, so the strings live here once.
 */
export const CREATE_ORDER_PATH = '/api/v1/orders'
export const ESTIMATE_PATH = '/api/v1/ahamove/estimate'
export const CREATE_ADDRESS_PATH = '/api/v1/addresses'
export const PUBLIC_CONFIGS_PATH = '/api/v1/configs/public'

/** `POST <pathname>`, matched on the pathname alone so a query string cannot break it. */
export const isPostTo =
  (pathname: string) =>
  (request: Request): boolean =>
    request.method() === 'POST' && new URL(request.url()).pathname === pathname

/** `GET /api/v1/orders/{id}/status` - the 5s poll the order detail page runs while Pending. */
export const isOrderStatusPoll = (request: Request): boolean => {
  const { pathname } = new URL(request.url())

  return request.method() === 'GET' && pathname.startsWith(`${CREATE_ORDER_PATH}/`) && pathname.endsWith('/status')
}

export interface RequestCounter {
  readonly count: number
}

/**
 * Counts the matching requests **this page** makes, for the rest of the test.
 *
 * This is the suite's answer to "did checkout do X?" for anything that would otherwise need
 * account-wide state. The whole suite shares one account and runs fully parallel, so
 * comparing a server-side list before and after cannot work: another spec's fixture is
 * creating and deleting its own rows throughout. A per-page counter is also the more precise
 * assertion - it sees exactly the calls this page made and nothing else.
 *
 * Arm it before the action, read `.count` after.
 */
export const countRequests = (page: Page, match: (request: Request) => boolean): RequestCounter => {
  let count = 0

  page.on('request', (request) => {
    if (match(request)) count++
  })

  return {
    get count() {
      return count
    }
  }
}

/** The common case: how many times this page POSTed to `pathname`. */
export const countPostsTo = (page: Page, pathname: string): RequestCounter => countRequests(page, isPostTo(pathname))

/**
 * Arm this **before** clicking submit: the request has to be awaited afterwards, so that the
 * body can be read without racing the click.
 */
export const waitForCreateOrderRequest = (page: Page) => page.waitForRequest(isPostTo(CREATE_ORDER_PATH))
