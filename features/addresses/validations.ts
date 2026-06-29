import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { createPhoneNumberSchema } from '@/shared/validations'
import z from 'zod'

export const createAddressSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return z.object({
    receiverName: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressReceiverName')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('profile.addressReceiverName'), max: 100 }) }),
    phoneNumber: createPhoneNumberSchema(t, t('profile.addressPhoneNumber')),
    addressLine: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressLine')) })
      .max(255, { error: t('common.validation.maxLength', { field: t('profile.addressLine'), max: 255 }) }),
    ward: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressWard')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('profile.addressWard'), max: 100 }) }),
    city: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressCity')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('profile.addressCity'), max: 100 }) }),
    country: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressCountry')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('profile.addressCountry'), max: 100 }) }),
    mapId: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('profile.addressMapId')) })
      .max(255, { error: t('common.validation.maxLength', { field: t('profile.addressMapId'), max: 255 }) }),
    latitude: z.number(),
    longitude: z.number(),
    isDefault: z.boolean()
  })
}

export type AddressFormValues = z.infer<ReturnType<typeof createAddressSchema>>
