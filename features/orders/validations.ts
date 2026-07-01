import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { createPhoneNumberSchema } from '@/shared/validations'
import z from 'zod'

export const createCheckoutSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.fullName')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('orders.checkout.fullName'), max: 100 }) }),
    phone: createPhoneNumberSchema(t, t('orders.checkout.phone')),
    remarks: z.string().max(500),
    addressLine: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.addressLine')) })
      .max(255),
    ward: z.string().min(1, { error: requiredFor(t('orders.checkout.ward')) }),
    city: z.string().min(1, { error: requiredFor(t('orders.checkout.city')) }),
    cityCode: z.number().refine((v) => v !== -1, { error: requiredFor(t('orders.checkout.city')) }),
    wardCode: z.number().refine((v) => v !== -1, { error: requiredFor(t('orders.checkout.ward')) }),
    latitude: z.number(),
    longitude: z.number(),
    mapId: z.string(),
    orderTime: z.string().nullable(),
    taxCode: z.string().trim().optional(),
    tagIds: z.array(z.number()).max(1)
  })
}

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>
