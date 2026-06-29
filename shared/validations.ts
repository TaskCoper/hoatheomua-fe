import { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

export const createEmailSchema = (t: TranslationFunction) => {
  return z
    .email({
      error: t('common.validation.email')
    })
    .toLowerCase()
}

export const VN_LOCAL_PHONE_REGEX = /^0\d{9,10}$/

export const createPhoneNumberSchema = (t: TranslationFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, { error: t('common.validation.required', { field: fieldLabel }) })
    .regex(VN_LOCAL_PHONE_REGEX, { error: t('common.validation.phoneNumber') })

export const createOptionalPhoneNumberSchema = (t: TranslationFunction) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || VN_LOCAL_PHONE_REGEX.test(v), { error: t('common.validation.phoneNumber') })
