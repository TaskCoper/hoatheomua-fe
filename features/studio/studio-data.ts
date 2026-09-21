import type { StudioBouquetIngredient, StudioStep } from '@/features/studio/types'

export const STUDIO_RIBBON_LABELS = ['RUY BĂNG']
export const STUDIO_WRAP_LABELS = ['GIẤY']

export const studioPriceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

export const formatStudioPrice = (amount: number) => studioPriceFormatter.format(Math.round(amount))

/** Which generated version a studio session opens on - see `StudioVersionQuerySync`. */
export const STUDIO_VERSION_QUERY_KEY = 'version'

/**
 * Where a finished design lives. A cart line points at the exact version it was bought
 * from, not simply the newest one the sitting went on to produce.
 */
export const buildStudioSessionHref = (rootProductId: string, sessionId: string, flowerId?: string | null) => {
  const base = `/products/${rootProductId}/studio`
  if (!sessionId) return base

  return flowerId
    ? `${base}/${sessionId}?${STUDIO_VERSION_QUERY_KEY}=${encodeURIComponent(flowerId)}`
    : `${base}/${sessionId}`
}

export const STUDIO_WHOLE_QUANTITY_STEP = 1
export const STUDIO_DECIMAL_QUANTITY_STEP = 0.1

export const studioQuantityFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 })

export const roundStudioQuantity = (value: number) => Math.round(value * 1000) / 1000

export const formatStudioQuantity = (value: number) => studioQuantityFormatter.format(roundStudioQuantity(value))

export const formatStudioIngredientCounts = (ingredients: StudioBouquetIngredient[]) =>
  ingredients
    .map((item) =>
      item.extraQuantity > 0
        ? `${item.ingredient.name} +${formatStudioQuantity(item.extraQuantity)}`
        : item.ingredient.name
    )
    .join(' · ')

export const STUDIO_GENERATION_STAGE_KEYS = ['preparing', 'lighting', 'composing', 'finishing'] as const

export const STUDIO_GENERATION_STAGE_INTERVAL = 350
export const STUDIO_GENERATION_PENDING_STAGE = STUDIO_GENERATION_STAGE_KEYS.length - 1
export const STUDIO_GENERATION_DONE_STAGE = STUDIO_GENERATION_STAGE_KEYS.length

export const STUDIO_DETAIL_KEYS = ['size', 'wrapping', 'freshness', 'handover'] as const

export const STUDIO_STEP_KEYS = [
  { step: 1, key: 'ingredients' },
  { step: 2, key: 'compose' },
  { step: 3, key: 'mockup' },
  { step: 4, key: 'preview' },
  { step: 5, key: 'result' }
] as const

export const STUDIO_LAST_STEP: StudioStep = 5

/**
 * A session that already has a result only reopens what a regenerate can change, so its rail
 * is three stops instead of five - the flowers and the finishing are fixed by then.
 */
export const STUDIO_SESSION_STEP_KEYS = [
  { step: 1, key: 'style' },
  { step: 2, key: 'mockup' },
  { step: 3, key: 'result' }
] as const

export const STUDIO_SESSION_STYLE_STEP: StudioStep = 1
export const STUDIO_SESSION_SCENE_STEP: StudioStep = 2
export const STUDIO_SESSION_LAST_STEP: StudioStep = 3

export type StudioStepKey = (typeof STUDIO_STEP_KEYS)[number]['key'] | (typeof STUDIO_SESSION_STEP_KEYS)[number]['key']

export const STUDIO_SESSION_FINISHED_COUNT = 3
export const STUDIO_SESSIONS_PAGE_SIZE = 10

export const STUDIO_MOCKUP_GALLERY_PAGE_SIZE = 12
