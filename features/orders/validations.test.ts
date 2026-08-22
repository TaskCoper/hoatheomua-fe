import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import viMessages from '@/lib/i18n/messages/vi.json'
import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import { InvoiceType } from './types'
import { createCheckoutSchema, createEstimateSchema, type CheckoutFormValues } from './validations'

/**
 * UT-003 / UT-004 - the two schemas the checkout gates on.
 *
 * `createEstimateSchema` runs when leaving step 1; `createCheckoutSchema` is the form's
 * resolver and runs on submit. Both are pure given a `t`.
 *
 * The translator is the **real** one, built from `vi.json` rather than stubbed, so these
 * tests also fail on a missing or renamed message key - the failure mode a stub `t` hides,
 * and the one that reaches the customer as a blank error.
 *
 * Not covered here: that any of this renders, blocks a submit, or suppresses a request.
 * That is CO-010 / CO-011 / CO-019. See COVERAGE-PLAN-v2.md §4.
 */

const t = createTranslator({ locale: 'vi', messages: viMessages }) as unknown as TranslationFunction

const checkoutSchema = createCheckoutSchema(t)
const estimateSchema = createEstimateSchema(t)

/** Valid on every base rule, so a case that changes one field produces exactly one issue. */
const baseValues = (overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues => ({
  phoneReceiver: '0909111111',
  remarks: '',
  addressLine: '166/41/4 Thích Quảng Đức',
  ward: 'Phường Đức Nhuận',
  city: 'Hồ Chí Minh',
  cityCode: 79,
  wardCode: 1,
  latitude: 10.8,
  longitude: 106.68,
  mapId: 'map-1',
  orderTime: 0,
  tagIds: [],
  taxCode: null,
  identityNumber: null,
  receiptFullName: null,
  receiptPhoneNumber: null,
  receiptAddress: null,
  receiptEmail: null,
  isExportInvoice: false,
  invoiceType: null,
  ...overrides
})

/** `{ path: message }` for whatever the schema rejected - the shape the UI maps to fields. */
const issuesOf = (schema: typeof checkoutSchema | typeof estimateSchema, values: CheckoutFormValues) => {
  const result = schema.safeParse(values)
  if (result.success) return {}

  return Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
}

const BUSINESS_REQUIRED = {
  taxCode: 'Mã số thuế là bắt buộc.',
  receiptEmail: 'Email nhận hoá đơn là bắt buộc.',
  receiptPhoneNumber: 'Số điện thoại nhận hoá đơn là bắt buộc.'
} as const

const PERSONAL_REQUIRED = {
  identityNumber: 'CCCD/CMND là bắt buộc.',
  receiptFullName: 'Họ và tên người nhận hoá đơn là bắt buộc.',
  receiptAddress: 'Địa chỉ nhận hoá đơn là bắt buộc.',
  receiptEmail: 'Email nhận hoá đơn là bắt buộc.',
  receiptPhoneNumber: 'Số điện thoại nhận hoá đơn là bắt buộc.'
} as const

const VALID_BUSINESS = { taxCode: '0101248141', receiptEmail: 'a@example.com', receiptPhoneNumber: '0912222222' }
const VALID_PERSONAL = {
  identityNumber: '079201234567',
  receiptFullName: 'E2E Personal Invoice',
  receiptAddress: '12 Nguyễn Huệ',
  receiptEmail: 'a@example.com',
  receiptPhoneNumber: '0912222222'
}

describe('UT-003 createCheckoutSchema invoice superRefine', () => {
  it('requires no invoice field while the invoice is switched off', () => {
    // every invoice field null, which is exactly what the switch-off path writes
    expect(issuesOf(checkoutSchema, baseValues({ isExportInvoice: false }))).toEqual({})
  })

  it('accepts a fully filled Business invoice', () => {
    expect(
      issuesOf(
        checkoutSchema,
        baseValues({ isExportInvoice: true, invoiceType: InvoiceType.Business, ...VALID_BUSINESS })
      )
    ).toEqual({})
  })

  it('accepts a fully filled Personal invoice', () => {
    expect(
      issuesOf(
        checkoutSchema,
        baseValues({ isExportInvoice: true, invoiceType: InvoiceType.Personal, ...VALID_PERSONAL })
      )
    ).toEqual({})
  })

  // one case per field rather than one all-empty case: a dropped `requireField` call is the
  // regression this catches, and only a per-field check sees which one went missing
  it.each(Object.entries(BUSINESS_REQUIRED))('requires %s on a Business invoice', (field, message) => {
    const issues = issuesOf(
      checkoutSchema,
      baseValues({ isExportInvoice: true, invoiceType: InvoiceType.Business, ...VALID_BUSINESS, [field]: null })
    )

    expect(issues).toEqual({ [field]: message })
  })

  it.each(Object.entries(PERSONAL_REQUIRED))('requires %s on a Personal invoice', (field, message) => {
    const issues = issuesOf(
      checkoutSchema,
      baseValues({ isExportInvoice: true, invoiceType: InvoiceType.Personal, ...VALID_PERSONAL, [field]: null })
    )

    expect(issues).toEqual({ [field]: message })
  })

  it('treats a whitespace-only value as missing', () => {
    const issues = issuesOf(
      checkoutSchema,
      baseValues({ isExportInvoice: true, invoiceType: InvoiceType.Business, ...VALID_BUSINESS, taxCode: '   ' })
    )

    expect(issues).toEqual({ taxCode: BUSINESS_REQUIRED.taxCode })
  })

  it('rejects a malformed receipt email', () => {
    const issues = issuesOf(
      checkoutSchema,
      baseValues({
        isExportInvoice: true,
        invoiceType: InvoiceType.Business,
        ...VALID_BUSINESS,
        receiptEmail: 'not-an-email'
      })
    )

    expect(issues).toEqual({ receiptEmail: 'Vui lòng nhập địa chỉ email hợp lệ.' })
  })

  it('rejects a malformed receipt phone number', () => {
    const issues = issuesOf(
      checkoutSchema,
      baseValues({
        isExportInvoice: true,
        invoiceType: InvoiceType.Business,
        ...VALID_BUSINESS,
        receiptPhoneNumber: '123'
      })
    )

    expect(issues).toEqual({ receiptPhoneNumber: 'Số điện thoại không hợp lệ (ví dụ: 0983 024 353).' })
  })

  /*
   * PINNED GAP, not a desired behaviour.
   *
   * The superRefine is an `if Business / else if Personal` with no else, so an invoice that
   * is switched on with no type selected requires nothing at all - it would submit with
   * `isExportInvoice: true` and every invoice field null. The UI cannot reach this today
   * because enabling the switch writes `InvoiceType.Personal` (invoice-fields.tsx:107); this
   * test exists so that if that default ever changes, the hole is already documented.
   */
  it('KNOWN GAP: an invoice with no type selected requires nothing', () => {
    expect(issuesOf(checkoutSchema, baseValues({ isExportInvoice: true, invoiceType: null }))).toEqual({})
  })
})

describe('UT-004 createEstimateSchema step-1 rules', () => {
  it('accepts a complete step-1 form', () => {
    expect(issuesOf(estimateSchema, baseValues())).toEqual({})
  })

  it.each([
    ['addressLine', 'Địa chỉ là bắt buộc.'],
    ['ward', 'Phường / Xã là bắt buộc.'],
    ['city', 'Tỉnh / Thành phố là bắt buộc.']
  ])('requires %s', (field, message) => {
    expect(issuesOf(estimateSchema, baseValues({ [field]: '' }))).toEqual({ [field]: message })
  })

  it('rejects a malformed phoneReceiver', () => {
    expect(issuesOf(estimateSchema, baseValues({ phoneReceiver: '123' }))).toEqual({
      phoneReceiver: 'Số điện thoại không hợp lệ (ví dụ: 0983 024 353).'
    })
  })

  it('caps remarks at 500 characters', () => {
    expect(issuesOf(estimateSchema, baseValues({ remarks: 'x'.repeat(500) }))).toEqual({})
    expect(issuesOf(estimateSchema, baseValues({ remarks: 'x'.repeat(501) }))).toEqual({
      remarks: 'Ghi chú không được vượt quá 500 ký tự.'
    })
  })

  it('caps addressLine at 255 characters', () => {
    expect(issuesOf(estimateSchema, baseValues({ addressLine: 'x'.repeat(255) }))).toEqual({})
    expect(issuesOf(estimateSchema, baseValues({ addressLine: 'x'.repeat(256) }))).toEqual({
      addressLine: 'Địa chỉ không được vượt quá 255 ký tự.'
    })
  })

  // the server does not enforce this at all - the rule is commented out in
  // CreateOrderRequestValidator, so the form is the only thing holding the line (CO-016)
  it('allows at most one delivery slot', () => {
    expect(issuesOf(estimateSchema, baseValues({ tagIds: [] }))).toEqual({})
    expect(issuesOf(estimateSchema, baseValues({ tagIds: [3] }))).toEqual({})
    expect(issuesOf(estimateSchema, baseValues({ tagIds: [3, 4] }))).toEqual({
      tagIds: 'Thời gian giao không được chọn quá 1 mục.'
    })
  })

  /*
   * PINNED GAP, not a desired behaviour.
   *
   * `latitude`/`longitude` are bare `z.number()`, and `defaultValues` ships them as 0
   * (use-estimate-order.ts:18-19). A form whose address never resolved to a coordinate
   * therefore passes step 1 and sends 0,0 to the Ahamove quote. This is the hole CO-021
   * describes from the UI side; pinning it here is far cheaper than driving a map.
   */
  it('KNOWN GAP: a zero coordinate passes step 1', () => {
    expect(issuesOf(estimateSchema, baseValues({ latitude: 0, longitude: 0 }))).toEqual({})
  })
})
