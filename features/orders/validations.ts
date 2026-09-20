import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import {
  createOptionalEmailSchema,
  createOptionalPhoneNumberSchema,
  createPhoneNumberSchema
} from '@/shared/validations'
import z from 'zod'
import type { CardConfig } from './cards/card-config'
import { createCheckoutCardSchema } from './cards/validations'
import { InvoiceType } from './types'

const createBaseCheckoutSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return z.object({
    fullNameReceiver: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.fullNameReceiver')) })
      .max(100, {
        error: t('common.validation.maxLength', { field: t('orders.checkout.fullNameReceiver'), max: 100 })
      }),
    phoneReceiver: createPhoneNumberSchema(t, t('orders.checkout.phoneReceiver')),
    remarks: z
      .string()
      .max(500, { error: t('common.validation.maxLength', { field: t('orders.checkout.remarks'), max: 500 }) }),
    addressLine: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.addressLine')) })
      .max(255, { error: t('common.validation.maxLength', { field: t('orders.checkout.addressLine'), max: 255 }) }),
    ward: z.string().min(1, { error: requiredFor(t('orders.checkout.ward')) }),
    city: z.string().min(1, { error: requiredFor(t('orders.checkout.city')) }),
    cityCode: z.number(),
    wardCode: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    mapId: z.string(),
    // ISO string from the date picker; the payload builder turns it into the
    // unix seconds the API expects.
    orderTime: z.string().nullable(),
    tagIds: z
      .array(z.number())
      .max(1, { error: t('common.validation.arrayMax', { field: t('orders.checkout.tag'), max: 1 }) })
  })
}

export const createEstimateSchema = (t: TranslationFunction) => createBaseCheckoutSchema(t)

export const createCheckoutSchema = (t: TranslationFunction, cardConfig: CardConfig) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return createBaseCheckoutSchema(t)
    .extend({
      cards: z.array(createCheckoutCardSchema(t, cardConfig)),
      taxCode: z
        .string()
        .trim()
        .max(20, { error: t('common.validation.maxLength', { field: t('orders.checkout.taxCodeLabel'), max: 20 }) })
        .nullable(),
      identityNumber: z
        .string()
        .trim()
        .max(20, { error: t('common.validation.maxLength', { field: t('orders.checkout.identityNumber'), max: 20 }) })
        .nullable(),
      receiptFullName: z
        .string()
        .trim()
        .max(100, {
          error: t('common.validation.maxLength', { field: t('orders.checkout.receiptFullName'), max: 100 })
        })
        .nullable(),
      receiptPhoneNumber: createOptionalPhoneNumberSchema(t).nullable(),
      receiptAddress: z
        .string()
        .trim()
        .max(255, {
          error: t('common.validation.maxLength', { field: t('orders.checkout.receiptAddress'), max: 255 })
        })
        .nullable(),
      receiptEmail: createOptionalEmailSchema(t).nullable(),
      isExportInvoice: z.boolean(),
      invoiceType: z.enum(InvoiceType).nullable()
    })
    .superRefine((data, ctx) => {
      if (!data.isExportInvoice) return

      const requireField = (field: keyof typeof data, label: string) => {
        const value = data[field]
        if (typeof value !== 'string' || value.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: requiredFor(label)
          })
        }
      }

      if (data.invoiceType === InvoiceType.Business) {
        requireField('taxCode', t('orders.checkout.taxCodeLabel'))
        requireField('receiptEmail', t('orders.checkout.receiptEmail'))
        requireField('receiptPhoneNumber', t('orders.checkout.receiptPhoneNumber'))
      } else if (data.invoiceType === InvoiceType.Personal) {
        requireField('identityNumber', t('orders.checkout.identityNumber'))
        requireField('receiptFullName', t('orders.checkout.receiptFullName'))
        requireField('receiptAddress', t('orders.checkout.receiptAddress'))
        requireField('receiptEmail', t('orders.checkout.receiptEmail'))
        requireField('receiptPhoneNumber', t('orders.checkout.receiptPhoneNumber'))
      }
    })
}

export type EstimateFormValues = z.infer<ReturnType<typeof createEstimateSchema>>
export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>
