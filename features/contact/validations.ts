import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

const VN_PHONE_REGEX = /^(?:\+84\d{9,10}|0\d{9,10})$/

export const createContactSchema = (t: TranslationFunction) =>
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, {
          error: t('common.validation.minLength', {
            field: t('contact.form.fullName'),
            min: 2
          })
        })
        .max(100, {
          error: t('common.validation.maxLength', {
            field: t('contact.form.fullName'),
            max: 100
          })
        }),
      email: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('contact.form.email')
          })
        })
        .max(254, {
          error: t('common.validation.maxLength', {
            field: t('contact.form.email'),
            max: 254
          })
        })
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase(),
      phoneNumber: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('contact.form.phoneNumber')
          })
        })
        .refine((val) => VN_PHONE_REGEX.test(val.replace(/[\s\-().]/g, '')), {
          error: t('common.validation.phoneNumber')
        }),
      topic: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('contact.form.topic')
          })
        }),
      message: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('contact.form.message')
          })
        })
        .max(1000, {
          error: t('common.validation.maxLength', {
            field: t('contact.form.message'),
            max: 1000
          })
        })
    })
    .strict()

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>
