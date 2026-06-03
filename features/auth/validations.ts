import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

export const createSignInSchema = (t: TranslationFunction) =>
  z
    .object({
      email: z
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase(),
      password: z
        .string()
        .trim()
        .min(6, {
          error: t('common.validation.minLength', {
            field: t('auth.signIn.password'),
            min: 6
          })
        })
        .max(128, {
          error: t('common.validation.maxLength', {
            field: t('auth.signIn.password'),
            max: 128
          })
        })
    })
    .strict()

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
