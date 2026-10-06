import type { I18nKey } from '@/lib/i18n/types'

export type MockVoucherKind = 'fixed' | 'percent'
export type MockVoucherVisibility = 'public' | 'private'

export interface MockVoucher {
  id: string
  code: string
  nameKey: I18nKey
  descriptionKey: I18nKey
  kind: MockVoucherKind
  value: number
  visibility: MockVoucherVisibility
  expiresAt: string
}

export const MOCK_PUBLIC_VOUCHERS: MockVoucher[] = [
  {
    id: 'public-october-20',
    code: 'HTM20OCT',
    nameKey: 'orders.checkout.voucher.mock.octoberOffer',
    descriptionKey: 'orders.checkout.voucher.mock.percent20',
    kind: 'percent',
    value: 20,
    visibility: 'public',
    expiresAt: '20/10/2026'
  },
  {
    id: 'public-gift-50000',
    code: 'HTM50000',
    nameKey: 'orders.checkout.voucher.mock.littleGift',
    descriptionKey: 'orders.checkout.voucher.mock.fixed50000',
    kind: 'fixed',
    value: 50000,
    visibility: 'public',
    expiresAt: '31/10/2026'
  },
  {
    id: 'public-november-10',
    code: 'HTM10NOV',
    nameKey: 'orders.checkout.voucher.mock.newMonth',
    descriptionKey: 'orders.checkout.voucher.mock.percent10',
    kind: 'percent',
    value: 10,
    visibility: 'public',
    expiresAt: '30/11/2026'
  },
  {
    id: 'public-fresh-30000',
    code: 'HTM30000',
    nameKey: 'orders.checkout.voucher.mock.freshFlowers',
    descriptionKey: 'orders.checkout.voucher.mock.fixed30000',
    kind: 'fixed',
    value: 30000,
    visibility: 'public',
    expiresAt: '15/11/2026'
  },
  {
    id: 'public-weekend-15',
    code: 'HTM15WEEK',
    nameKey: 'orders.checkout.voucher.mock.gentleWeekend',
    descriptionKey: 'orders.checkout.voucher.mock.percent15',
    kind: 'percent',
    value: 15,
    visibility: 'public',
    expiresAt: '30/11/2026'
  },
  {
    id: 'public-love-80000',
    code: 'HTM80000',
    nameKey: 'orders.checkout.voucher.mock.seasonOfLove',
    descriptionKey: 'orders.checkout.voucher.mock.fixed80000',
    kind: 'fixed',
    value: 80000,
    visibility: 'public',
    expiresAt: '20/12/2026'
  },
  {
    id: 'public-season-12',
    code: 'HTM12SEASON',
    nameKey: 'orders.checkout.voucher.mock.inSeason',
    descriptionKey: 'orders.checkout.voucher.mock.percent12',
    kind: 'percent',
    value: 12,
    visibility: 'public',
    expiresAt: '31/12/2026'
  },
  {
    id: 'public-thanks-20000',
    code: 'HTM20000',
    nameKey: 'orders.checkout.voucher.mock.thankYou',
    descriptionKey: 'orders.checkout.voucher.mock.fixed20000',
    kind: 'fixed',
    value: 20000,
    visibility: 'public',
    expiresAt: '31/12/2026'
  },
  {
    id: 'public-special-25',
    code: 'HTM25SPECIAL',
    nameKey: 'orders.checkout.voucher.mock.specialOffer',
    descriptionKey: 'orders.checkout.voucher.mock.percent25',
    kind: 'percent',
    value: 25,
    visibility: 'public',
    expiresAt: '31/12/2026'
  },
  {
    id: 'public-bloom-70000',
    code: 'HTM70000',
    nameKey: 'orders.checkout.voucher.mock.bloomingJoy',
    descriptionKey: 'orders.checkout.voucher.mock.fixed70000',
    kind: 'fixed',
    value: 70000,
    visibility: 'public',
    expiresAt: '31/12/2026'
  }
]

export const MOCK_PRIVATE_VOUCHERS: MockVoucher[] = [
  {
    id: 'private-partner',
    code: 'HTMPRIVATE20',
    nameKey: 'orders.checkout.voucher.mock.partnerOffer',
    descriptionKey: 'orders.checkout.voucher.mock.fixed100000',
    kind: 'fixed',
    value: 100000,
    visibility: 'private',
    expiresAt: '31/12/2026'
  }
]

export const MOCK_VOUCHERS = [...MOCK_PUBLIC_VOUCHERS, ...MOCK_PRIVATE_VOUCHERS]
