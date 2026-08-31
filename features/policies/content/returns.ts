import type { PolicySectionData } from '@/features/policies/components/policy-section'
import type { Locale } from '@/lib/i18n/routing'
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Flower2Icon,
  HandHeartIcon,
  RecycleIcon,
  ToolsIcon
} from '@hugeicons/core-free-icons'

export const RETURNS_CONTENT: Record<Locale, PolicySectionData[]> = {
  vi: [
    {
      icon: HandHeartIcon,
      title: 'Cam kết của Hoa Theo Mùa & Mokar',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa và Mokar đặt sự hài lòng của khách hàng làm trọng tâm. Khi sản phẩm chưa đáp ứng đúng cam kết hoặc gặp lỗi trong quá trình vận chuyển, chúng tôi sẽ chủ động đổi / trả hàng và hoàn tiền theo các điều kiện sau đây.'
        }
      ]
    },
    {
      number: '01',
      icon: ToolsIcon,
      title: 'Sản phẩm công cụ - dụng cụ',
      intro: 'Áp dụng cho bình, kéo, lót bình và các sản phẩm phụ kiện khác.',
      blocks: [
        {
          type: 'list',
          items: [
            'Khi sản phẩm bị lỗi từ nhà sản xuất.',
            'Khi giao không đúng mẫu mã so với đơn đặt hàng và tư vấn.',
            'Khi giao không đúng số lượng đã xác nhận.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: Flower2Icon,
      title: 'Sản phẩm hoa tươi',
      intro: 'Hoa Theo Mùa sẽ đổi / trả khi các trường hợp sau đây xảy ra:',
      blocks: [
        {
          type: 'list',
          items: [
            'Không đúng chủng loại hoa hoặc mẫu hoa như đơn đặt hàng.',
            'Hoa bị hư hỏng, dập nát trong quá trình vận chuyển đến khách.',
            'Số lượng hoa không đúng với đơn hàng đã đặt.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: Calendar03Icon,
      title: 'Lan Hồ Điệp mini (Mokar)',
      blocks: [
        {
          type: 'paragraph',
          text: 'Đổi trả trong vòng 7 ngày kể từ ngày giao hoa khi hoa bị héo, úng hoặc không đạt chuẩn cam kết.'
        },
        {
          type: 'note',
          text: 'Để được đổi trả nhanh nhất, vui lòng chụp ảnh tình trạng hoa và gửi cho tư vấn viên qua Zalo OA hoặc Fanpage Mokar Orchids.'
        }
      ]
    },
    {
      number: '04',
      icon: CheckmarkCircle02Icon,
      title: 'Cách thức yêu cầu đổi trả',
      blocks: [
        {
          type: 'ordered',
          items: [
            'Liên hệ hotline 0931 734 353 hoặc nhắn tin Zalo / Fanpage Hoa Theo Mùa trong vòng 2 giờ kể từ khi nhận hàng.',
            'Gửi hình ảnh và mô tả tình trạng sản phẩm để tư vấn viên xác nhận.',
            'Sau khi xác nhận, Hoa Theo Mùa sẽ tiến hành đổi sản phẩm tương đương hoặc hoàn tiền theo thoả thuận.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: RecycleIcon,
      title: 'Điều kiện sản phẩm trả về',
      blocks: [
        {
          type: 'list',
          items: [
            'Sản phẩm còn nguyên vẹn bao bì, chưa qua sử dụng đối với công cụ dụng cụ.',
            'Đối với hoa, sản phẩm cần được bảo quản đúng cách trước khi liên hệ đổi trả.',
            'Mọi yêu cầu đổi trả ngoài phạm vi nêu trên sẽ được xem xét theo thiện chí của hai bên.'
          ]
        }
      ]
    }
  ],
  en: [
    {
      icon: HandHeartIcon,
      title: 'Our promise from Hoa Theo Mua & Mokar',
      blocks: [
        {
          type: 'paragraph',
          text: 'Customer satisfaction is at the heart of Hoa Theo Mua and Mokar. When a product does not meet our promise or arrives damaged, we will exchange or refund it under the conditions below.'
        }
      ]
    },
    {
      number: '01',
      icon: ToolsIcon,
      title: 'Tools & accessories',
      intro: 'Applies to vases, scissors, vase liners and similar accessories.',
      blocks: [
        {
          type: 'list',
          items: [
            'When the product has a manufacturing defect.',
            'When the design delivered differs from the order or consultation.',
            'When the quantity received does not match what was confirmed.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: Flower2Icon,
      title: 'Fresh flower products',
      intro: 'Hoa Theo Mua will exchange or replace when:',
      blocks: [
        {
          type: 'list',
          items: [
            'The flower variety or design does not match the order.',
            'The flowers were damaged or crushed during delivery to you.',
            'The quantity of flowers does not match the confirmed order.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: Calendar03Icon,
      title: 'Mokar mini phalaenopsis',
      blocks: [
        {
          type: 'paragraph',
          text: 'Exchanges accepted within 7 days from the delivery date when the flowers wilt, become waterlogged, or fail to meet our quality promise.'
        },
        {
          type: 'note',
          text: 'For the fastest resolution, please capture a photo of the flowers and send it to our concierge through Zalo OA or the Mokar Orchids Facebook page.'
        }
      ]
    },
    {
      number: '04',
      icon: CheckmarkCircle02Icon,
      title: 'How to request a return',
      blocks: [
        {
          type: 'ordered',
          items: [
            'Reach out to the hotline 0931 734 353 or message us on Zalo / Facebook within 2 hours of delivery.',
            'Send photos and a brief description of the product so our concierge can verify it.',
            'After confirmation, Hoa Theo Mua will replace the product with an equivalent or refund according to the agreement.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: RecycleIcon,
      title: 'Conditions for returned items',
      blocks: [
        {
          type: 'list',
          items: [
            'Accessories must remain in their original packaging and unused.',
            'Flowers should be stored correctly before raising the return request.',
            'Any return request outside the cases above will be reviewed in good faith on both sides.'
          ]
        }
      ]
    }
  ]
}
