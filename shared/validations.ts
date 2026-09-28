import { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import z from 'zod'

export const createEmailSchema = (t: TranslationFunction) => {
  return z
    .email({
      error: t('common.validation.email')
    })
    .toLowerCase()
}

export const createOptionalEmailSchema = (t: TranslationFunction) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || z.email().safeParse(v).success, { error: t('common.validation.email') })

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

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

const PASSWORD_ALLOWED_CHARS_REGEX = /^[\x21-\x7E]+$/

const PASSWORD_REQUIREMENTS: ReadonlyArray<{
  key: I18nKey
  test: (value: string) => boolean
}> = [
  {
    key: 'common.validation.password.lowercase',
    test: (value) => /[a-z]/.test(value)
  },
  {
    key: 'common.validation.password.uppercase',
    test: (value) => /[A-Z]/.test(value)
  },
  {
    key: 'common.validation.password.number',
    test: (value) => /[0-9]/.test(value)
  },
  {
    key: 'common.validation.password.specialChar',
    test: (value) => /[^A-Za-z0-9]/.test(value)
  }
]

export const createPasswordSchema = (t: TranslationFunction, fieldLabel: string) =>
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      error: t('common.validation.minLength', {
        field: fieldLabel,
        min: PASSWORD_MIN_LENGTH
      })
    })
    .max(PASSWORD_MAX_LENGTH, {
      error: t('common.validation.maxLength', {
        field: fieldLabel,
        max: PASSWORD_MAX_LENGTH
      })
    })
    .superRefine((value, ctx) => {
      // Length errors are already handled by .min() / .max().
      if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
        return
      }

      if (!PASSWORD_ALLOWED_CHARS_REGEX.test(value)) {
        ctx.addIssue({
          code: 'custom',
          message: t('common.validation.password.invalidCharacters', {
            field: fieldLabel
          })
        })
        return
      }

      const missing = PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(value)).map((requirement) =>
        t(requirement.key)
      )

      if (missing.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('common.validation.password.missing', {
            field: fieldLabel,
            missing: missing.join(', ')
          })
        })
      }
    })
