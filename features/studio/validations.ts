import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import z from 'zod'

export const STUDIO_NAME_MAX_LENGTH = 50

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

const createStudioIdSchema = (t: TranslationFunction, field: I18nKey) => {
  const error = t('common.validation.required', { field: t(field) })

  return z
    .string()
    .trim()
    .min(1, { error })
    .refine((value) => value.toLowerCase() !== EMPTY_GUID, { error })
}

export const createStudioSchema = (t: TranslationFunction) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { error: t('studio.step1.nameError') })
        .max(STUDIO_NAME_MAX_LENGTH, {
          error: t('common.validation.maxLength', {
            field: t('studio.review.creationName'),
            max: STUDIO_NAME_MAX_LENGTH
          })
        }),
      mockupId: createStudioIdSchema(t, 'studio.result.mockup'),
      productId: createStudioIdSchema(t, 'studio.result.flowers'),
      ingredientQuantities: z
        .record(
          z.string(),
          z.number().min(0, {
            error: t('common.validation.required', { field: t('studio.compose.quantity.label') })
          })
        )
        .refine((value) => Object.keys(value).length > 0, { error: t('studio.generation.noMaterials') }),
      styleId: createStudioIdSchema(t, 'studio.compose.style.label'),
      ribbonId: createStudioIdSchema(t, 'studio.compose.ribbon.label'),
      wrapId: createStudioIdSchema(t, 'studio.compose.wrap.label')
    })
    .strict()

export type StudioFormValues = z.infer<ReturnType<typeof createStudioSchema>>

export const createRegenerateStudioSchema = (t: TranslationFunction) =>
  z
    .object({
      bundleId: createStudioIdSchema(t, 'studio.compose.style.label'),
      mockupId: createStudioIdSchema(t, 'studio.result.mockup')
    })
    .strict()

export type RegenerateStudioFormValues = z.infer<ReturnType<typeof createRegenerateStudioSchema>>
