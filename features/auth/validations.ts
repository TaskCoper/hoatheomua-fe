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

export const createSignUpSchema = (t: TranslationFunction) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('auth.signUp.firstName')
          })
        })
        .min(2, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.firstName'),
            min: 2
          })
        })
        .max(50, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.firstName'),
            max: 50
          })
        }),
      lastName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('auth.signUp.lastName')
          })
        })
        .min(2, {
          error: t('common.validation.minLength', {
            field: t('auth.signUp.lastName'),
            min: 2
          })
        })
        .max(50, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.lastName'),
            max: 50
          })
        }),
      email: z
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase(),
      password: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('auth.signUp.password')
          })
        })
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
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
          error: t('common.validation.passwordStrength')
        }),
      confirmPassword: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', {
            field: t('auth.signUp.confirmPassword')
          })
        })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      error: t('common.validation.passwordMismatch')
    })
    .strict()

export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
