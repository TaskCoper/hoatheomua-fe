import type { ProductDetail } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import { describe, expect, it } from 'vitest'
import { buildCheckoutPayload, buildEstimatePayload, type OrderContact } from './payloads'
import { InvoiceType, PaymentGateway, PaymentMethod } from './types'
import type { CheckoutFormValues } from './validations'

/**
 * UT-001 / UT-002 - the two pure builders that turn checkout form state into the bodies
 * sent to `POST /api/v1/ahamove/estimate` and `POST /api/v1/orders`.
 *
 * These cover the payload contract only. Whether the form ever reaches these states is
 * CO-009's job, and whether the server honours the result is CO-003/CO-004/CO-006's.
 * See COVERAGE-PLAN-v2.md §4.
 */

const contact: OrderContact = { fullName: 'Nguyễn Văn A', phone: '0909000111' }

const cartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  lineId: 'line-1',
  productId: 'local-product-1',
  variantId: null,
  quantity: 1,
  selectedOptions: {},
  addedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
})

/**
 * Only `nhanhProductId` is ever read off the catalogue entry. A full `ProductDetail` has
 * ~60 fields and building one would assert nothing extra, so the cast is deliberate.
 */
const catalogueEntry = (nhanhProductId: string | null): ProductDetail => ({ nhanhProductId }) as ProductDetail

const checkoutValues = (overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues => ({
  phoneReceiver: '0909000111',
  remarks: 'DEV TEST',
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

/** Every invoice field populated, so each case below only has to change `invoiceType`. */
const ALL_INVOICE_FIELDS = {
  taxCode: '0316871672',
  identityNumber: '079201000123',
  receiptFullName: 'Nguyễn Văn A',
  receiptAddress: '12 Nguyễn Huệ',
  receiptEmail: 'a@example.com',
  receiptPhoneNumber: '0983024353'
} satisfies Partial<CheckoutFormValues>

const buildCheckout = (values: CheckoutFormValues, items: CartItem[] = [cartItem()]) =>
  buildCheckoutPayload(
    values,
    items,
    new Map([['local-product-1', catalogueEntry('nhanh-1')]]),
    contact,
    PaymentMethod[1],
    PaymentGateway.BaoKim,
    0
  )

describe('UT-001 buildCheckoutPayload invoice-branch filtering', () => {
  // When invoice export is disabled, all invoice-related fields must be null.
  it('nulls every invoice field when the invoice is switched off, whatever the form still holds', () => {
    const payload = buildCheckout(checkoutValues({ ...ALL_INVOICE_FIELDS, isExportInvoice: false }))

    expect(payload.isExportInvoice).toBe(false)

    expect(payload.invoiceType).toBeNull()
    expect(payload.taxCode).toBeNull()
    expect(payload.identityNumber).toBeNull()
    expect(payload.receiptFullName).toBeNull()
    expect(payload.receiptAddress).toBeNull()
    expect(payload.receiptEmail).toBeNull()
    expect(payload.receiptPhoneNumber).toBeNull()
  })

  // When Business is selected, all Personal-specific fields must be null.
  it('sends the tax code and drops the personal fields on a Business invoice', () => {
    const payload = buildCheckout(
      checkoutValues({
        ...ALL_INVOICE_FIELDS,
        isExportInvoice: true,
        invoiceType: InvoiceType.Business
      })
    )

    expect(payload.invoiceType).toBe(InvoiceType.Business)

    expect(payload.taxCode).toBe(ALL_INVOICE_FIELDS.taxCode)
    expect(payload.identityNumber).toBeNull()
    expect(payload.receiptFullName).toBeNull()
    expect(payload.receiptAddress).toBeNull()
  })

  // When Personal is selected, all Business-specific fields must be null.
  it('sends the personal fields and drops the tax code on a Personal invoice', () => {
    const payload = buildCheckout(
      checkoutValues({
        ...ALL_INVOICE_FIELDS,
        isExportInvoice: true,
        invoiceType: InvoiceType.Personal
      })
    )

    expect(payload.invoiceType).toBe(InvoiceType.Personal)

    expect(payload.identityNumber).toBe(ALL_INVOICE_FIELDS.identityNumber)
    expect(payload.receiptFullName).toBe(ALL_INVOICE_FIELDS.receiptFullName)
    expect(payload.receiptAddress).toBe(ALL_INVOICE_FIELDS.receiptAddress)

    // Personal invoices must not include a tax code.
    expect(payload.taxCode).toBeNull()
  })

  // receiptEmail and receiptPhoneNumber are shared by both Personal and Business invoices.
  it('sends the receipt email and phone on both invoice types', () => {
    for (const invoiceType of [InvoiceType.Business, InvoiceType.Personal]) {
      const payload = buildCheckout(
        checkoutValues({
          ...ALL_INVOICE_FIELDS,
          isExportInvoice: true,
          invoiceType
        })
      )

      expect(payload.receiptEmail, `receiptEmail on a ${invoiceType} invoice`).toBe(ALL_INVOICE_FIELDS.receiptEmail)

      expect(payload.receiptPhoneNumber, `receiptPhoneNumber on a ${invoiceType} invoice`).toBe(
        ALL_INVOICE_FIELDS.receiptPhoneNumber
      )
    }
  })

  // Whitespace-only values should be normalized to null to avoid sending meaningless data.
  it('collapses whitespace-only invoice fields to null', () => {
    const payload = buildCheckout(
      checkoutValues({
        isExportInvoice: true,
        invoiceType: InvoiceType.Personal,
        identityNumber: '   ',
        receiptFullName: '',
        receiptAddress: '\t\n',
        receiptEmail: '  ',
        receiptPhoneNumber: ''
      })
    )

    expect(payload.identityNumber).toBeNull()
    expect(payload.receiptFullName).toBeNull()
    expect(payload.receiptAddress).toBeNull()
    expect(payload.receiptEmail).toBeNull()
    expect(payload.receiptPhoneNumber).toBeNull()
  })
})

describe('UT-002 buildEstimatePayload field mapping', () => {
  const estimateValues = () => checkoutValues({ orderTime: 1_767_225_600, tagIds: [3] })

  it('uses the Nhanh.vn product ID for each cart line', () => {
    const payload = buildEstimatePayload(
      estimateValues(),
      [cartItem()],
      new Map([['local-product-1', catalogueEntry('4934329')]]),
      contact
    )

    // The cart uses our internal UUID, while the estimate API expects the Nhanh.vn product ID.
    expect(payload.items).toEqual([{ itemId: '4934329', number: 1 }])
  })

  it('falls back to the product UUID when the catalogue has no entry', () => {
    const payload = buildEstimatePayload(estimateValues(), [cartItem()], new Map(), contact)

    // If the product is missing from the catalogue, fall back to the product UUID.
    expect(payload.items).toEqual([{ itemId: 'local-product-1', number: 1 }])
  })

  it('falls back to the product UUID when the catalogue entry has no Nhanh.vn ID', () => {
    const payload = buildEstimatePayload(
      estimateValues(),
      [cartItem()],
      new Map([['local-product-1', catalogueEntry(null)]]),
      contact
    )

    // If the catalogue entry has no Nhanh.vn ID, fall back to the product UUID.
    expect(payload.items).toEqual([{ itemId: 'local-product-1', number: 1 }])
  })

  it('carries every line with its own quantity, in cart order', () => {
    // Cart items
    const items = [
      cartItem({ lineId: 'line-1', productId: 'local-product-1', quantity: 1 }),
      cartItem({ lineId: 'line-2', productId: 'local-product-2', quantity: 2 }),
      cartItem({ lineId: 'line-3', productId: 'local-product-3', quantity: 1 })
    ]

    // Map internal product UUIDs to Nhanh.vn product IDs.
    const productById = new Map([
      ['local-product-1', catalogueEntry('4934329')],
      ['local-product-2', catalogueEntry('4934330')],
      ['local-product-3', catalogueEntry('4934331')]
    ])

    const payload = buildEstimatePayload(estimateValues(), items, productById, contact)

    // Each item should use the mapped Nhanh.vn ID while preserving quantity and cart order.
    expect(payload.items).toEqual([
      { itemId: '4934329', number: 1 },
      { itemId: '4934330', number: 2 },
      { itemId: '4934331', number: 1 }
    ])
  })

  it('joins the address parts into both address fields', () => {
    const payload = buildEstimatePayload(estimateValues(), [cartItem()], new Map(), contact)

    // The address should combine addressLine, ward, and city.
    expect(payload.address).toBe('166/41/4 Thích Quảng Đức, Phường Đức Nhuận, Hồ Chí Minh')

    // shortAddress should currently match the full address.
    expect(payload.shortAddress).toBe(payload.address)
  })

  it('passes the delivery fields through untouched', () => {
    const payload = buildEstimatePayload(estimateValues(), [cartItem()], new Map(), contact)

    // orderTime and tagIds should be passed through without modification.
    expect(payload.orderTime).toBe(1_767_225_600)
    expect(payload.tagIds).toEqual([3])
  })
})
