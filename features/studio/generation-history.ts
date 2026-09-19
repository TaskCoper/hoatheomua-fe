import { studioMockups } from '@/features/studio/studio-data'
import type { StudioGeneration } from '@/features/studio/types'

const SEED_PRODUCT = { id: 'seasonal-blush', name: 'Seasonal Blush' }

/**
 * TODO(backend): there is no studio-generation service yet. The studio itself keeps
 * its versions in component state and loses them on unload, so this is the only
 * source the account history has. Set to `[]` to review the empty state.
 */
const SEEDS: { id: string; name: string; mockupId: string; createdAt: string }[] = [
  { id: 'gen-1', name: 'Cho mẹ, 20/10', mockupId: 'vietnamese-womens-day', createdAt: '2026-09-05T09:20:00.000Z' },
  { id: 'gen-2', name: 'Sunday Blush', mockupId: 'sunday-home', createdAt: '2026-09-04T02:45:00.000Z' },
  { id: 'gen-3', name: 'A quiet thank you', mockupId: 'atelier-light', createdAt: '2026-09-02T11:10:00.000Z' },
  { id: 'gen-4', name: 'Sinh nhật Minh Anh', mockupId: 'birthday-table', createdAt: '2026-08-30T04:05:00.000Z' },
  { id: 'gen-5', name: 'Golden afternoon', mockupId: 'golden-hour', createdAt: '2026-08-27T08:30:00.000Z' },
  { id: 'gen-6', name: 'Buổi sáng trong vườn', mockupId: 'garden-morning', createdAt: '2026-08-22T01:15:00.000Z' },
  { id: 'gen-7', name: 'Paper & twine', mockupId: 'paper-twine', createdAt: '2026-08-18T07:40:00.000Z' },
  { id: 'gen-8', name: 'Café ngày thường', mockupId: 'cafe-corner', createdAt: '2026-08-14T10:05:00.000Z' }
]

export const MOCK_STUDIO_GENERATIONS: StudioGeneration[] = SEEDS.flatMap((seed) => {
  const mockup = studioMockups.find((item) => item.id === seed.mockupId)
  if (!mockup) return []

  return [
    {
      id: seed.id,
      name: seed.name,
      productId: SEED_PRODUCT.id,
      productName: SEED_PRODUCT.name,
      mockupId: mockup.id,
      mockupName: mockup.name,
      imageUrl: mockup.imageUrl,
      createdAt: seed.createdAt
    }
  ]
})
