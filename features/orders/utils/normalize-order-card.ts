import type { OrderDetailCardItem } from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object'

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * `GET v1/order-details/{id}/cards` returns `{ id, name, imageUrl }` rows. Whether they arrive
 * as a bare array or inside a paginated envelope is not settled, so both are unwrapped here
 * rather than guessed at the call site. A row without an id cannot be shown or chosen.
 */
export const toOrderDetailCardItems = (value: unknown): OrderDetailCardItem[] => {
  const rows = Array.isArray(value) ? value : isRecord(value) && Array.isArray(value.items) ? value.items : []

  return rows
    .filter(isRecord)
    .map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      imageUrl: asString(row.imageUrl)
    }))
    .filter((row) => row.id.length > 0)
}
