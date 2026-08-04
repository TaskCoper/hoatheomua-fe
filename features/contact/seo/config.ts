import type { LocaleCopy, SeoCopy } from '@/shared/seo'

export const CONTACT_BASE_PATH = '/contact'

type ContactCopy = SeoCopy & { breadcrumb: string }

export const CONTACT_COPY = {
  vi: {
    title: 'Liên Hệ - Hoa Theo Mùa',
    description:
      'Liên hệ Hoa Theo Mùa để đặt hoa tươi cao cấp, hoa sự kiện, bó hoa theo yêu cầu hoặc nhận tư vấn giao hoa tận nơi trong 2 giờ tại TP. Hồ Chí Minh.',
    keywords: [
      'liên hệ Hoa Theo Mùa',
      'đặt hoa tươi TP HCM',
      'hotline shop hoa',
      'email shop hoa',
      'tư vấn hoa sự kiện',
      'giao hoa tận nơi'
    ],
    ogAlt: 'Liên hệ Hoa Theo Mùa - Hoa tươi cao cấp tại TP. HCM',
    breadcrumb: 'Liên hệ'
  },
  en: {
    title: 'Contact - Hoa Theo Mùa',
    description:
      'Contact Hoa Theo Mùa to order premium fresh flowers, event bouquets, or custom floral arrangements with same-day delivery within 2 hours in Ho Chi Minh City.',
    keywords: [
      'contact Hoa Theo Mua',
      'order flowers HCMC',
      'florist hotline Vietnam',
      'event flowers contact',
      'flower delivery enquiry',
      'custom bouquet Vietnam'
    ],
    ogAlt: 'Contact Hoa Theo Mùa - Premium florist in Ho Chi Minh City',
    breadcrumb: 'Contact'
  }
} satisfies LocaleCopy<ContactCopy>
