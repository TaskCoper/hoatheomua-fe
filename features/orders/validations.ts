import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import z from 'zod'

export const createCheckoutSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.fullName')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('orders.checkout.fullName'), max: 100 }) }),
    phone: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.phone')) })
      .regex(/^(\+?\d{8,15})$/, { error: t('common.validation.phoneNumber') }),
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
    mapId: z.string()
  })
}

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>
