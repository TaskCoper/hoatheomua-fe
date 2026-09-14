import { studioSizes } from '@/features/studio/studio-data'
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
      sizeId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.compose.size.label') })
      }),
      styleId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.compose.style.label') })
      }),
      ribbonId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.compose.ribbon.label') })
      }),
      wrapId: z.string().min(1, {
        error: t('common.validation.required', { field: t('studio.compose.wrap.label') })
      }),
      /** The base product fills the first slot, so this holds the remaining flowerCount - 1 picks. */
      companionProductIds: z.array(z.string())
    })
    .strict()
    .superRefine((values, ctx) => {
      const size = studioSizes.find((item) => item.id === values.sizeId)
      if (!size) return

      if (values.companionProductIds.length !== size.flowerCount - 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['companionProductIds'],
          message: t('studio.compose.bouquet.incomplete', { count: size.flowerCount })
        })
      }
    })

export type StudioFormValues = z.infer<ReturnType<typeof createStudioSchema>>
