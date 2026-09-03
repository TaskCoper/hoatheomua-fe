import type { TaxBusinessInfo } from '../types'

export const normalizeTaxBusinessInfo = (response: unknown): TaxBusinessInfo | null => {
  const candidate =
    response && typeof response === 'object' ? ((response as { data?: unknown }).data ?? response) : null

  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const raw = candidate as Partial<TaxBusinessInfo>

  if (!raw.id || !raw.name || !raw.address) {
    return null
  }

  return {
    id: String(raw.id),
    name: String(raw.name),
    address: String(raw.address)
  }
}
