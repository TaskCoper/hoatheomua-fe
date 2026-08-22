import type { BusinessInvoice, PersonalInvoice } from '../pages/checkout.page'

/**
 * Invoice fixtures shared by every spec that turns the VAT switch on.
 *
 * These were duplicated across CO-003, CO-004, CO-009, CO-010 and CO-011 - shared immutable
 * fixture data rather than deliberately-varied input, in the same sense as
 * `e2e/fixtures/products.ts`. See COVERAGE-PLAN-v2.md §2.
 */

/**
 * A real, lookup-resolvable tax code: the VietQR panel CO-003 asserts only renders when
 * `api.vietqr.io` resolves the code, so an invented one would make that case vacuous.
 */
export const BUSINESS_INVOICE: BusinessInvoice = {
  taxCode: '0101248141',
  email: 'dev.test@hoatheomua.invalid',
  // deliberately not the address's receiver phone (`0909111111`): the invoice fields and the
  // delivery fields must not cross-wire, and identical values would hide it if they did
  phoneNumber: '0912222222'
}

/** The business name `api.vietqr.io` returns for `BUSINESS_INVOICE.taxCode`. */
export const TAX_BUSINESS_NAME = 'FPT'

export const PERSONAL_INVOICE: PersonalInvoice = {
  // CCCD length, and inside the schema's 20-char cap
  identityNumber: '079201234567',
  fullName: 'E2E Personal Invoice',
  email: 'dev.test@hoatheomua.invalid',
  phoneNumber: '0912222222',
  address: 'DEV TEST - 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
}

/**
 * What "no invoice" looks like on the wire **and** on the order read back - the create-order
 * payload and the order detail carry the same eight fields under the same names.
 *
 * Asserted as a whole rather than field by field because the risk is a *leak*: one invoice
 * value surviving from form state into an order that was never meant to carry one.
 */
export const NO_INVOICE_FIELDS = {
  isExportInvoice: false,
  invoiceType: null,
  taxCode: null,
  identityNumber: null,
  receiptFullName: null,
  receiptPhoneNumber: null,
  receiptAddress: null,
  receiptEmail: null
} as const
