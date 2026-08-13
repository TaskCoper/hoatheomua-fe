import { DEFAULT_POPUP_FREQUENCY, DEFAULT_POPUP_PAGES } from '@/features/promotions/constants'
import type { PromotionPopupCollection } from '@/types/config.type'

/**
 * Rendered only when there is NO `promotions.popup` config at all (missing row,
 * bad JSON, or failed request) - never as an override for `section.enabled: false`,
 * which is marketing's kill switch. Keep every campaign here evergreen (no dates,
 * no seasonal claim): a dated fallback risks going stale with nobody watching it.
 */
export const DEFAULT_PROMOTION_POPUP: PromotionPopupCollection = {
  section: {
    enabled: true,
    frequency: DEFAULT_POPUP_FREQUENCY,
    pages: [...DEFAULT_POPUP_PAGES]
  },
  items: [
    {
      id: 'pp_default_delivery',
      image: 'https://taskcoper.hcm.ss.bfcplatform.vn/general/mfdzls-9.jpg',
      href: '/delivery',
      openInNewTab: false,
      alt: {
        vi: 'Giao hoa tận nơi trong ngày tại TP.HCM - đặt trước 15h, hoa tươi đến tay trong vài giờ',
        en: 'Same-day flower delivery across Ho Chi Minh City - order before 3pm and your fresh flowers arrive within hours'
      },
      startDate: '',
      endDate: '',
      enabled: true,
      pages: []
    },
    {
      id: 'pp_default_b2b',
      image: 'https://taskcoper.hcm.ss.bfcplatform.vn/general/4ydg2o-10.jpg',
      href: '/b2b',
      openInNewTab: false,
      alt: {
        vi: 'Hoa doanh nghiệp Hoa Theo Mùa - trang trí sự kiện, khai trương và hoa văn phòng theo hợp đồng',
        en: 'Hoa Theo Mua for business - event styling, opening ceremonies and contract office flowers'
      },
      startDate: '',
      endDate: '',
      enabled: true,
      pages: []
    }
  ]
}
