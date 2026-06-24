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

export const createVerifyEmailSchema = (t: TranslationFunction) =>
  z
    .object({
      email: z
        .string()
        .trim()
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase(),
      code: z
        .string()
        .trim()
        .length(6, {
          error: t('auth.verifyEmail.codeLength')
        })
    })
    .strict()
export const forgotPasswordFormValues = (t: TranslationFunction) =>
  z
    .object({
      email: z
        .string()
        .trim()
        .email({
          error: t('common.validation.email')
        })
        .toLowerCase()
    })
    .strict()

export const resetPassWordFormValue = (t: TranslationFunction) => {
  return z
    .object({
      newPassword: z
        .string()
        .trim()
        .min(8, t('auth.signUp.validation.password.minLength'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t('auth.signUp.validation.password.strong')
        )
    })
    .strict()
}
export const verifyCodeSchema = (t: TranslationFunction) => {
  return z
    .object({
      email: z.email(t('common.validation.email')).trim(),
      code: z.string().trim().min(6, t('common.validation.email'))
    })
    .strict()
}
export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordFormValues>>
export type ResetPassWordFormValue = z.infer<ReturnType<typeof resetPassWordFormValue>>
export type VerifyEmailFormValues = z.infer<ReturnType<typeof createVerifyEmailSchema>>
export type VerifyCodeFormValues = z.infer<ReturnType<typeof verifyCodeSchema>>
