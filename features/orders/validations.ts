import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import {
  createOptionalEmailSchema,
  createOptionalPhoneNumberSchema,
  createPhoneNumberSchema
} from '@/shared/validations'
import z from 'zod'
import { countWords, type CardConfig } from './cards/card-config'
import { createCheckoutCardSchema } from './cards/validations'
import { InvoiceType } from './types'

export const ORDER_REMARKS_MAX_WORDS = 35

// 10 digits, or 10 + a 3-digit branch suffix (written with or without the hyphen).
export const VN_TAX_CODE_REGEX = /^\d{10}(-?\d{3})?$/
// The 12-digit CCCD, or the 9-digit CMND it replaced.
export const VN_IDENTITY_NUMBER_REGEX = /^(\d{9}|\d{12})$/

const createBaseCheckoutSchema = (t: TranslationFunction) => {
  const requiredFor = (field: string) => t('common.validation.required', { field })
  // 0 is what an unresolved address leaves behind (typed but never picked from the
  // suggestions or the map), and no delivery point sits on the equator or prime meridian.
  const resolvedCoordinate = () =>
    z.number().refine((value) => value !== 0, { error: t('orders.checkout.locationRequired') })

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
      .max(500, { error: t('common.validation.maxLength', { field: t('orders.checkout.remarks'), max: 500 }) })
      .refine((value) => countWords(value) <= ORDER_REMARKS_MAX_WORDS, {
        error: t('orders.checkout.cards.messageMaxWords', { max: ORDER_REMARKS_MAX_WORDS })
      }),
    addressLine: z
      .string()
      .trim()
      .min(1, { error: requiredFor(t('orders.checkout.addressLine')) })
      .max(255, { error: t('common.validation.maxLength', { field: t('orders.checkout.addressLine'), max: 255 }) }),
    ward: z.string().min(1, { error: requiredFor(t('orders.checkout.ward')) }),
    city: z.string().min(1, { error: requiredFor(t('orders.checkout.city')) }),
    cityCode: z.number(),
    wardCode: z.number(),
    latitude: resolvedCoordinate(),
    longitude: resolvedCoordinate(),
    mapId: z.string(),
    // ISO string from the date picker; the payload builder turns it into the
    // unix seconds the API expects.
    orderTime: z.string().nullable(),
    tagIds: z
      .array(z.number())
      .min(1, { error: requiredFor(t('orders.checkout.tag')) })
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

      // Checked here rather than on the field: switching the invoice type hides the other
      // type's inputs without clearing them, and a hidden field must never block the order.
      const requireFormat = (field: 'taxCode' | 'identityNumber', pattern: RegExp, message: string) => {
        const value = data[field]?.trim()
        if (value && !pattern.test(value)) {
          ctx.addIssue({ code: 'custom', path: [field], message })
        }
      }

      if (data.invoiceType === InvoiceType.Business) {
        requireField('taxCode', t('orders.checkout.taxCodeLabel'))
        requireFormat('taxCode', VN_TAX_CODE_REGEX, t('orders.checkout.taxCodeInvalid'))
        requireField('receiptEmail', t('orders.checkout.receiptEmail'))
        requireField('receiptPhoneNumber', t('orders.checkout.receiptPhoneNumber'))
      } else if (data.invoiceType === InvoiceType.Personal) {
        requireField('identityNumber', t('orders.checkout.identityNumber'))
        requireFormat('identityNumber', VN_IDENTITY_NUMBER_REGEX, t('orders.checkout.identityNumberInvalid'))
        requireField('receiptFullName', t('orders.checkout.receiptFullName'))
        requireField('receiptAddress', t('orders.checkout.receiptAddress'))
        requireField('receiptEmail', t('orders.checkout.receiptEmail'))
        requireField('receiptPhoneNumber', t('orders.checkout.receiptPhoneNumber'))
      }
    })
}

export type EstimateFormValues = z.infer<ReturnType<typeof createEstimateSchema>>
export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>

type CheckoutField = keyof CheckoutFormValues

// The fields each checkout step owns. Leaving a step validates only its own group, and a
// failed final submit uses the groups to send the user back to the step holding the error.
export const DELIVERY_STEP_FIELDS = [
  'fullNameReceiver',
  'phoneReceiver',
  'remarks',
  'addressLine',
  'ward',
  'city',
  'cityCode',
  'wardCode',
  'latitude',
  'longitude',
  'mapId',
  'orderTime',
  'tagIds'
] as const satisfies readonly CheckoutField[]

export const CARDS_STEP_FIELDS = ['cards'] as const satisfies readonly CheckoutField[]

export const INVOICE_STEP_FIELDS = [
  'isExportInvoice',
  'invoiceType',
  'taxCode',
  'identityNumber',
  'receiptFullName',
  'receiptPhoneNumber',
  'receiptAddress',
  'receiptEmail'
] as const satisfies readonly CheckoutField[]
