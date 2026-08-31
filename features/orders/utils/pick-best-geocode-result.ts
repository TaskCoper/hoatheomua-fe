import type { GeoResponse, GeoResult } from '../types'

const COMBINING_MARKS = /[̀-ͯ]/g

const normalizeAddress = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/\s+/g, ' ').trim()

export const pickBestGeocodeResult = (inputAddress: string, response?: GeoResponse): GeoResult | null => {
  if (!response || response.status !== 'OK' || response.results.length === 0) {
    return null
  }

  const normalizedInput = normalizeAddress(inputAddress)

  const exactMatch = response.results.find((result) => normalizeAddress(result.formatted_address) === normalizedInput)

  if (exactMatch) {
    return exactMatch
  }

  return response.results[0]
}
