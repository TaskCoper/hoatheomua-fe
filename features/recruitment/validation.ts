import { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

const hasRichTextContent = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length > 0

export const createRecruitmentRequestSchema = (t: TranslationFunction) =>
  z
    .object({
      jobDescriptionId: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('careers.form.role')
          })
        }),
      title: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('careers.form.role')
          })
        }),
      coverLetter: z.string().refine(hasRichTextContent, {
        error: t('common.validation.required', {
          field: t('careers.form.coverLetter')
        })
      }),
      attachments: z.array(
        z.object({
          value: z.string()
        })
      )
    })
    .strict()

export type CreateRecruitmentRequest = z.infer<ReturnType<typeof createRecruitmentRequestSchema>>
