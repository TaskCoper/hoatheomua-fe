import type { CardTemplate } from '@/types/card-template.type'

export type CardTemplateOrientation = 'vertical' | 'horizontal'

export const CARD_TEMPLATE_ORIENTATIONS: CardTemplateOrientation[] = ['vertical', 'horizontal']

/** Square artwork reads as a portrait card. */
export const toCardTemplateOrientation = (ratio: number): CardTemplateOrientation =>
  ratio > 1 ? 'horizontal' : 'vertical'

/**
 * The API sends no dimensions, so ratios are measured from the image once it paints. Kept for
 * the session so re-opening the picker lays out right away instead of settling again.
 */
const ratioCache = new Map<string, number>()

export const getCachedTemplateRatios = (): Map<string, number> => new Map(ratioCache)

export const cacheTemplateRatio = (templateId: string, ratio: number): boolean => {
  if (!Number.isFinite(ratio) || ratio <= 0 || ratioCache.get(templateId) === ratio) return false

  ratioCache.set(templateId, ratio)
  return true
}

export interface GroupedCardTemplates {
  vertical: CardTemplate[]
  horizontal: CardTemplate[]
  /** Not measured yet - rendered anyway, since painting is what measures them. */
  pending: CardTemplate[]
}

export const groupCardTemplates = (
  templates: CardTemplate[],
  ratios: ReadonlyMap<string, number>
): GroupedCardTemplates => {
  const grouped: GroupedCardTemplates = { vertical: [], horizontal: [], pending: [] }

  templates.forEach((template) => {
    const ratio = ratios.get(template.id)

    if (ratio === undefined) {
      grouped.pending.push(template)
      return
    }

    grouped[toCardTemplateOrientation(ratio)].push(template)
  })

  return grouped
}
