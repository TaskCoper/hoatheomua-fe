import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import {
  createOptionalEmailSchema,
  createOptionalPhoneNumberSchema,
  createPhoneNumberSchema
} from '@/shared/validations'
import z from 'zod'
import { InvoiceType } from './types'

export const createEstimateSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.fullName')) })
      .max(100, { error: t('common.validation.maxLength', { field: t('orders.checkout.fullName'), max: 100 }) }),
    phone: createPhoneNumberSchema(t, t('orders.checkout.phone')),
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
    cityCode: z.number().refine((v) => v !== -1, { error: requiredFor(t('orders.checkout.city')) }),
    wardCode: z.number().refine((v) => v !== -1, { error: requiredFor(t('orders.checkout.ward')) }),
    latitude: z.number(),
    longitude: z.number(),
    mapId: z.string(),
    orderTime: z.number(),
    tagIds: z
      .array(z.number())
      .min(1, { error: t('common.validation.arrayMin', { field: t('orders.checkout.tag'), min: 1 }) })
      .max(1, { error: t('common.validation.arrayMax', { field: t('orders.checkout.tag'), max: 1 }) })
  })
}

export const createCheckoutSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })

  return createEstimateSchema(t)
    .extend({
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
