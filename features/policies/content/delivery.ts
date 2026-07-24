import type { Locale } from '@/lib/i18n/routing'
import {
  AlarmClockIcon,
  CheckmarkSquare02Icon,
  ClockIcon,
  DeliveryTruck01Icon,
  Location01Icon,
  MessageMultiple02Icon,
  Note02Icon,
  PackageOpenIcon,
  UnavailableIcon
} from '@hugeicons/core-free-icons'
import type { PolicySectionData } from '@/features/policies/components/policy-section'

export const DELIVERY_CONTENT: Record<Locale, PolicySectionData[]> = {
  vi: [
    {
      icon: DeliveryTruck01Icon,
      title: 'Tinh thần của Chính sách',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chính sách vận chuyển Hoa Theo Mùa được quy định nhằm bảo đảm và nâng cao chất lượng dịch vụ, sản phẩm trong suốt quá trình vận chuyển. Chính sách được áp dụng từ ngày 01/01/2022 trên toàn hệ thống Hoa Theo Mùa.'
        }
      ]
    },
    {
      number: '01',
      icon: Note02Icon,
      title: 'Chính sách giao nhận hoa',
      blocks: [
        {
          type: 'ordered',
          items: [
            'Hoa Theo Mùa áp dụng theo giá cước của các đơn vị vận chuyển (Ahamove, Grab, …).',
            'Trường hợp không đúng địa chỉ giao hàng do bạn cung cấp — chúng tôi chủ động liên lạc với người nhận (hoặc bạn) để chuyển sang địa chỉ chính xác. Phí vận chuyển tính theo điều 1.',
            'Trường hợp không liên lạc được với người nhận và bạn, Hoa Theo Mùa lưu sản phẩm trong 03 tiếng. Sau thời gian này, nếu chưa nhận được địa chỉ chính xác, đơn hàng sẽ bị huỷ và không hoàn tiền.',
            'Trường hợp người nhận đi vắng, Hoa Theo Mùa sẽ giao cho người được uỷ quyền hoặc đặt nơi an toàn khi được người nhận cho phép.',
            'Trường hợp người nhận yêu cầu giao vào thời điểm khác trong 03 giờ kể từ lúc bạn yêu cầu, Florist sẽ chủ động báo lại bạn và điều chỉnh miễn phí. Sau thời gian này, vui lòng thanh toán chi phí phát sinh.',
            'Trường hợp người nhận từ chối nhận hoa và bạn không muốn giao tiếp, đơn hoa sẽ bị huỷ và không hoàn tiền. Nếu muốn chuyển sang địa chỉ khác, bạn vui lòng thanh toán chi phí phát sinh.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: ClockIcon,
      title: 'Thời gian nhận & giao hoa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa bắt đầu nhận và giao hoa từ 07h00 – 18h00 các ngày Thứ 2 – Chủ Nhật (không bao gồm ngày lễ).'
        },
        {
          type: 'list',
          items: [
            'Giờ nhận sớm nhất là 07h00, muộn nhất 18h00 hoặc tuỳ khả năng của từng chi nhánh. Vui lòng liên hệ hotline 0931 734 353 với các yêu cầu đặc biệt.',
            'Các sản phẩm hoa (trừ bình cắm) không cắm sẵn và không trưng bày thành phẩm tại cửa hàng. Vui lòng đặt trước mẫu/loại hoa ưng ý — Hoa Theo Mùa sẽ giao trong 2 giờ kể từ khi xác nhận đặt hoa.',
            'Bạn có thể gửi lời chúc đặc biệt: tư vấn viên sẽ chọn hình thức tag hoặc thiệp thiết kế signature của Hoa Theo Mùa.',
            'Hoa Theo Mùa có gói cắm hoa dành riêng cho doanh nghiệp. Liên hệ Hotline 0931 734 353 hoặc Email hoatheomua.02@gmail.com để được tư vấn chi tiết.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: PackageOpenIcon,
      title: 'Kiểm tra hàng',
      intro:
        'Sau khi bạn đặt hàng thành công tại hoatheomua.net, Hoa Theo Mùa sẽ gọi điện xác nhận đơn hàng. Quá trình giao – nhận luôn đi kèm bước kiểm tra để đảm bảo bạn yên tâm tuyệt đối.',
      blocks: [
        {
          type: 'subheading',
          text: 'Đồng kiểm trước khi thanh toán'
        },
        {
          type: 'list',
          items: [
            'Trước khi nhận hàng, bạn vui lòng kiểm tra sản phẩm.',
            'Vui lòng mở gói hàng để kiểm tra đúng mẫu, số lượng và màu sắc.',
            'Sau khi đồng ý với sản phẩm, bạn thanh toán cho nhân viên giao hàng (trường hợp ship COD).',
            'Nếu chưa ưng ý hoặc sản phẩm không như cam kết, Hoa Theo Mùa sẽ thay thế khi sản phẩm trả về còn nguyên vẹn. Yêu cầu đổi hàng cần được gửi trong vòng 2 giờ sau khi nhận.'
          ]
        }
      ]
    },
    {
      number: '04',
      icon: AlarmClockIcon,
      title: 'Lưu ý quan trọng',
      blocks: [
        {
          type: 'list',
          items: [
            'Khi kiểm tra đơn hàng, nhân viên giao nhận sẽ chờ bạn kiểm tra hàng bên trong sản phẩm. Nếu nhân viên từ chối, vui lòng liên hệ hotline 0931 734 353.',
            'Hoa Theo Mùa không chịu trách nhiệm về số lượng, mẫu mã cũng như lỗi sản phẩm sau khi đơn hàng đã giao quá 2 giờ.',
            'Không dùng vật sắc nhọn để mở gói hàng nhằm tránh làm hư hỏng sản phẩm bên trong.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: Location01Icon,
      title: 'Khu vực phục vụ',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa hỗ trợ giao hoa nội thành TP. Hồ Chí Minh và các tỉnh lân cận theo cước vận chuyển thực tế. Đối với các đơn hàng đặc biệt ngoài khu vực, vui lòng liên hệ tư vấn viên để được sắp xếp riêng.'
        }
      ]
    },
    {
      number: '06',
      icon: CheckmarkSquare02Icon,
      title: 'Cam kết của Hoa Theo Mùa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa luôn hướng đến dịch vụ giao hàng tốt nhất cho mọi đơn hoa. Mỗi đơn hàng đều được tư vấn viên đồng hành xuyên suốt — từ xác nhận chi tiết, sản xuất tỉ mỉ đến giao tận tay người nhận.'
        },
        {
          type: 'note',
          text: 'Mọi góp ý hỗ trợ, vui lòng liên hệ Hotline 0931 734 353 hoặc Email sale.hoatheomua@gmail.com. Cảm ơn quý khách luôn tin tưởng sử dụng dịch vụ và sản phẩm của Hoa Theo Mùa!'
        }
      ]
    },
    {
      icon: MessageMultiple02Icon,
      title: 'Yêu cầu đặc biệt?',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nếu bạn cần giao trong khung giờ đặc biệt, chuẩn bị bất ngờ cho người thân, hoặc đặt hoa số lượng lớn cho sự kiện — nhắn cho Hoa Theo Mùa qua Zalo OA, Fanpage hoặc gọi trực tiếp hotline. Chúng tôi sẽ thiết kế một giải pháp riêng cho bạn.'
        }
      ]
    },
    {
      icon: UnavailableIcon,
      title: 'Trường hợp không hoàn tiền',
      blocks: [
        {
          type: 'paragraph',
          text: 'Để minh bạch và bảo vệ chất lượng dịch vụ, một số trường hợp đơn hoa sẽ không được hoàn tiền: huỷ đơn sau 03 tiếng không liên hệ được người nhận, người nhận từ chối nhận hoa và bạn không muốn giao tiếp, hoặc khách hàng không thực hiện đồng kiểm tại thời điểm nhận hàng.'
        }
      ]
    }
  ],
  en: [
    {
      icon: DeliveryTruck01Icon,
      title: 'The spirit behind this policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'The Hoa Theo Mua delivery policy is designed to safeguard and elevate the quality of every shipment. It applies across the Hoa Theo Mua network from January 1, 2022.'
        }
      ]
    },
    {
      number: '01',
      icon: Note02Icon,
      title: 'Delivery rules',
      blocks: [
        {
          type: 'ordered',
          items: [
            'Hoa Theo Mua applies the rates from delivery partners (Ahamove, Grab, etc.).',
            'If the address you provided is inaccurate, we proactively contact the recipient (or you) to confirm the correct one. The delivery fee follows rule 1.',
            'If neither the recipient nor you are reachable, we keep the flowers safe for 03 hours. After that, without a correct address, the order is cancelled and not refunded.',
            'If the recipient is unavailable, we hand over to an authorised person or place the flowers in a safe spot when permitted.',
            'If the recipient asks to receive at a different time within 03 hours from your request, our florist will adjust the schedule free of charge. After that, additional fees may apply.',
            'If the recipient declines the flowers and you do not wish to communicate further, the order is cancelled and not refunded. Re-routing to a new address requires the related shipping cost.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: ClockIcon,
      title: 'Order intake & delivery hours',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua accepts orders and delivers from 7:00 AM to 6:00 PM, Monday to Sunday (excluding public holidays).'
        },
        {
          type: 'list',
          items: [
            'Earliest pickup is 7:00 AM, latest 6:00 PM, subject to each branch capacity. Reach hotline 0931 734 353 for special requirements.',
            'Most arrangements (except vase compositions) are not pre-styled or displayed at the store. Place your order first — we deliver within 2 hours from confirmation.',
            'Want a special message? Our concierge will craft a signature tag or branded card on your behalf.',
            'We offer dedicated floral packages for businesses. Contact 0931 734 353 or hoatheomua.02@gmail.com for a tailored consultation.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: PackageOpenIcon,
      title: 'On-spot inspection',
      intro:
        'After your order is confirmed on hoatheomua.net, we call to verify the details. The handover always includes inspection so you receive your flowers with confidence.',
      blocks: [
        {
          type: 'subheading',
          text: 'Joint inspection before payment'
        },
        {
          type: 'list',
          items: [
            'Please inspect the product before receiving it.',
            'Open the packaging to confirm the design, quantity and colour match your order.',
            'Once happy, you may settle with the courier (for COD orders) and accept the delivery.',
            'If the product is not satisfactory or differs from the promise, Hoa Theo Mua will replace it as long as the returned product is intact. Submit the request within 2 hours of receiving.'
          ]
        }
      ]
    },
    {
      number: '04',
      icon: AlarmClockIcon,
      title: 'Important reminders',
      blocks: [
        {
          type: 'list',
          items: [
            'During inspection, our courier must wait for you. If they refuse, please call hotline 0931 734 353 right away.',
            'After 2 hours from delivery, Hoa Theo Mua is no longer responsible for product issues, defects, or quantity discrepancies.',
            'Avoid using sharp tools to open the packaging — it may damage the arrangement inside.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: Location01Icon,
      title: 'Service coverage',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua delivers across Ho Chi Minh City and nearby provinces at standard logistic rates. For exceptional out-of-zone requests, contact our concierge for a tailored arrangement.'
        }
      ]
    },
    {
      number: '06',
      icon: CheckmarkSquare02Icon,
      title: 'Our delivery commitment',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua strives to provide the best delivery experience for every order. A concierge accompanies each request — from detailed confirmation to careful production and the final handover.'
        },
        {
          type: 'note',
          text: 'For any feedback or assistance, please reach hotline 0931 734 353 or sale.hoatheomua@gmail.com. Thank you for choosing Hoa Theo Mua!'
        }
      ]
    },
    {
      icon: MessageMultiple02Icon,
      title: 'Have a special request?',
      blocks: [
        {
          type: 'paragraph',
          text: 'For a precise delivery window, a surprise plan, or bulk arrangements for an event — message us on Zalo OA, Facebook, or call the hotline directly. We will tailor a solution just for you.'
        }
      ]
    },
    {
      icon: UnavailableIcon,
      title: 'Non-refundable scenarios',
      blocks: [
        {
          type: 'paragraph',
          text: 'For clarity and quality protection, refunds are not issued in certain cases: cancellations after 03 hours without contact, the recipient declines and you do not wish to follow up, or the customer skipping joint inspection on arrival.'
        }
      ]
    }
  ]
}
