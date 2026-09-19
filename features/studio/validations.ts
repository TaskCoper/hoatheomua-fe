import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

export const STUDIO_NAME_MAX_LENGTH = 50

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
      mockupId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.result.mockup') })
      }),
      productId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.result.flowers') })
      }),
      ingredientQuantities: z.record(
        z.string(),
        z.number().min(0, {
          error: t('common.validation.required', { field: t('studio.compose.quantity.label') })
        })
      ),
      styleId: z.string(),
      ribbonId: z.string(),
      wrapId: z.string()
    })
    .strict()

export type StudioFormValues = z.infer<ReturnType<typeof createStudioSchema>>
