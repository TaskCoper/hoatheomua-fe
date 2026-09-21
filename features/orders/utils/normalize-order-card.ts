import type { OrderDetailCardItem } from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object'

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

export const toOrderDetailCardItems = (value: unknown): OrderDetailCardItem[] => {
  const rows = isRecord(value) && Array.isArray(value.cards) ? value.cards : []

  return rows
    .filter(isRecord)
    .map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      imageUrl: asString(row.imageUrl)
    }))
    .filter((row) => row.id.length > 0)
}
