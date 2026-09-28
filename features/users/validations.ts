import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { createEmailSchema, createOptionalPhoneNumberSchema, createPasswordSchema } from '@/shared/validations'
import z from 'zod'
import { normalizePhoneNumber } from './phone-number'

export const createSignInSchema = (t: TranslationFunction) =>
  z
    .object({
      phoneNumber: z.string().trim().refine(value => normalizePhoneNumber(value) !== null, { error: t('auth.phone.invalidPhone') }),
      password: z
        .string()
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
          error: t('common.validation.minLength', {
            field: t('auth.signUp.lastName'),
            min: 1
          })
        })
        .max(50, {
          error: t('common.validation.maxLength', {
            field: t('auth.signUp.lastName'),
            max: 50
          })
        }),
      phoneNumber: z.string().trim().refine(value => normalizePhoneNumber(value) !== null, { error: t('auth.phone.invalidPhone') }),
      password: createPasswordSchema(t, t('auth.signUp.password')),
      confirmPassword: z.string().min(1, {
        error: t('common.validation.required', { field: t('auth.signUp.confirmPassword') })
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      error: t('common.validation.passwordMismatch')
    })
    .strict()

export const createUpdateMeSchema = (t: TranslationFunction, isPhone = false) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', { field: t('profile.firstName') })
        })
        .max(50, {
          error: t('common.validation.maxLength', { field: t('profile.firstName'), max: 50 })
        }),
      lastName: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', { field: t('profile.lastName') })
        })
        .max(50, {
          error: t('common.validation.maxLength', { field: t('profile.lastName'), max: 50 })
        }),
      email: isPhone ? z.string() : createEmailSchema(t),
      avatar: z
        .string()
        .trim()
        .max(500, { error: t('common.validation.maxLength', { field: t('profile.avatar'), max: 500 }) }),
      coverImageUrl: z
        .string()
        .trim()
        .max(500, { error: t('common.validation.maxLength', { field: t('profile.coverImageUrl'), max: 500 }) }),
      phoneNumber: createOptionalPhoneNumberSchema(t),
      address: z
        .string()
        .trim()
        .max(255, { error: t('common.validation.maxLength', { field: t('profile.address'), max: 255 }) }),
      city: z
        .string()
        .trim()
        .max(100, { error: t('common.validation.maxLength', { field: t('profile.city'), max: 100 }) }),
      state: z
        .string()
        .trim()
        .max(100, { error: t('common.validation.maxLength', { field: t('profile.state'), max: 100 }) }),
      timeZone: z
        .string()
        .trim()
        .min(1, {
          error: t('common.validation.required', { field: t('profile.timeZone') })
        })
        .max(100, {
          error: t('common.validation.maxLength', { field: t('profile.timeZone'), max: 100 })
        }),
      domainIds: z.array(z.string())
    })
    .strict()

export const createChangePasswordSchema = (t: TranslationFunction) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, {
          error: t('common.validation.required', { field: t('profile.currentPassword') })
        })
        .max(128, {
          error: t('common.validation.maxLength', { field: t('profile.currentPassword'), max: 128 })
        }),
      newPassword: createPasswordSchema(t, t('profile.newPassword')),
      confirmPassword: z.string().min(1, {
        error: t('common.validation.required', { field: t('profile.confirmNewPassword') })
      })
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      path: ['newPassword'],
      error: t('profile.newPasswordMustDiffer')
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      error: t('common.validation.passwordMismatch')
    })
    .strict()
export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
export type UpdateMeFormValues = z.infer<ReturnType<typeof createUpdateMeSchema>>
export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>
