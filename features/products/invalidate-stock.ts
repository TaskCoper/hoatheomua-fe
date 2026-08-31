import { getQueryClient } from '@/lib/react-query-client'
import { SELLABLE_QUANTITY_QUERY_PREFIX } from './queries'

/**
 * Throws away every cached sellable-quantity list after a cart mutation.
 *
 * Stock is keyed by the exact set of ids a page asked for, so the cart's list and
 * the product detail page's list are separate entries that never see each other's
 * numbers. Touching the cart is the moment a buyer is most likely to walk back to
 * `/products/{id}`, and that page is the one rendering from an hour-old static
 * `sellableQuantity`.
 */
export const invalidateSellableQuantity = () => {
  // Server renders get a throwaway client per request - nothing to invalidate.
  if (typeof window === 'undefined') return

  const queryClient = getQueryClient()

  // Whatever is on screen right now - the cart itself - re-reads immediately.
  void queryClient.invalidateQueries({ queryKey: SELLABLE_QUANTITY_QUERY_PREFIX, refetchType: 'active' })

  // Backgrounded readers are dropped rather than marked stale. `staleTime: 0`
  // already refetches them on their next mount, but React Query paints the cached
  // number first and swaps it when the request lands; with no entry left inside the
  // 60s `gcTime` window the product page renders the API's answer instead of
  // flashing the stock the buyer just walked away from.
  queryClient.removeQueries({ queryKey: SELLABLE_QUANTITY_QUERY_PREFIX, type: 'inactive' })
}
