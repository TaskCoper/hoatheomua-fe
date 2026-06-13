import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { createEmailSchema } from '@/shared/validations'
import z from 'zod'

export const createSignInSchema = (t: TranslationFunction) =>
  z
    .object({
      email: createEmailSchema(t),
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

export const createSignUpSchema = (t: TranslationFunction) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.firstName'),
            min: 1
          })
        })
        .max(100, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.firstName'),
            max: 100
          })
        }),
      lastName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.lastName'),
            min: 1
          })
        })
        .max(100, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.lastName'),
            max: 100
          })
        }),
      email: z
        .string()
        .trim()
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase(),
      password: z
        .string()
        .trim()
        .min(6, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.password'),
            min: 6
          })
        })
        .max(128, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.password'),
            max: 128
          })
        })
        .refine((value) => /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value), {
          error: t('common.validation.passwordStrength')
        }),
      confirmPassword: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.confirmPassword'),
            min: 1
          })
        })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      error: t('common.validation.passwordMismatch')
    })
    .strict()

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
