import type { PolicySectionData } from '@/features/policies/components/policy-section'
import type { Locale } from '@/lib/i18n/routing'
import {
  BankIcon,
  CallIcon,
  CheckmarkCircle02Icon,
  Discount01Icon,
  Facebook01Icon,
  InternetIcon,
  InvoiceIcon,
  Money03Icon,
  QrCodeIcon,
  Search01Icon,
  ShoppingBasket03Icon,
  TicketStarIcon,
  Wallet01Icon
} from '@hugeicons/core-free-icons'

export const ORDERING_CONTENT: Record<Locale, PolicySectionData[]> = {
  vi: [
    {
      icon: InternetIcon,
      title: 'Ba cách đặt hoa tại Hoa Theo Mùa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Không cần đến cửa hàng, bạn vẫn có thể đặt hoa Hoa Theo Mùa nhanh chóng bằng cách chọn một trong các kênh online sau đây. Mỗi cách đều được tư vấn viên đồng hành để đảm bảo bạn nhận được sản phẩm ưng ý nhất.'
        }
      ]
    },
    {
      number: '01',
      icon: ShoppingBasket03Icon,
      title: 'Cách 1 - Đặt hàng trực tiếp trên website',
      intro: 'Truy cập website hoatheomua.com và thực hiện theo các bước sau:',
      blocks: [
        {
          type: 'subheading',
          text: 'Bước 1 - Tìm sản phẩm cần mua'
        },
        {
          type: 'list',
          items: [
            'Sử dụng thanh menu để lựa chọn loại sản phẩm bạn cần.',
            'Chọn sản phẩm chi tiết phù hợp với nhu cầu và dịp tặng.'
          ]
        },
        {
          type: 'subheading',
          text: 'Bước 2 - Thêm vào giỏ hàng'
        },
        {
          type: 'list',
          items: [
            'Click vào sản phẩm, chọn màu sắc và kích thước hoa.',
            'Nhấn "Mua hàng" rồi chọn "Xem giỏ hàng" để kiểm tra đơn của bạn.'
          ]
        },
        {
          type: 'subheading',
          text: 'Bước 3 - Nhập ưu đãi & chọn phương thức thanh toán'
        },
        {
          type: 'list',
          items: [
            'Nhập MÃ ƯU ĐÃI (nếu có), nhấn "Áp dụng" rồi chọn "Tiến hành thanh toán".',
            'Điền đầy đủ thông tin và ghi chú đơn hàng (ví dụ: giao trong giờ hành chính, giao nhanh 2 giờ).',
            'Chọn hình thức thanh toán phù hợp và nhấn "Đặt hàng" để hoàn tất.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: CallIcon,
      title: 'Cách 2 - Đặt hoa qua hotline',
      blocks: [
        {
          type: 'paragraph',
          text: 'Gọi điện thoại đến tổng đài 0931 734 353 từ 8h00 – 17h30 để đặt hàng online. Đội ngũ Hoa Theo Mùa luôn sẵn sàng phục vụ, tư vấn và hỗ trợ bạn lựa chọn sản phẩm ưng ý nhất.'
        }
      ]
    },
    {
      number: '03',
      icon: Facebook01Icon,
      title: 'Cách 3 - Đặt hoa qua Fanpage Hoa Theo Mùa',
      blocks: [
        {
          type: 'subheading',
          text: 'Bước 1 - Truy cập Fanpage'
        },
        {
          type: 'list',
          items: [
            'Fanpage Hoa Theo Mùa: facebook.com/lancaocapmokar',
            'Fanpage Lan Hồ Điệp Mokar Orchids: facebook.com/lancaocapmokar'
          ]
        },
        {
          type: 'subheading',
          text: 'Bước 2 - Nhắn tin trao đổi cùng tư vấn viên'
        },
        {
          type: 'paragraph',
          text: 'Chọn sản phẩm bạn yêu thích và nhắn tin cho Hoa Theo Mùa để trao đổi trực tiếp về mẫu hoa, thời gian giao và thông tin thanh toán.'
        }
      ]
    },
    {
      number: '04',
      icon: Wallet01Icon,
      title: 'Phương thức thanh toán',
      intro: 'Hoa Theo Mùa cung cấp hai phương thức thanh toán linh hoạt:',
      blocks: [
        {
          type: 'subheading',
          text: 'Thanh toán tiền mặt (COD)'
        },
        {
          type: 'paragraph',
          text: 'Bạn thanh toán bằng tiền mặt cho nhân viên giao hàng ngay khi nhận đơn hoa. Phù hợp với những đơn hàng cần kiểm tra trực tiếp tại điểm giao.'
        },
        {
          type: 'subheading',
          text: 'Thanh toán bằng chuyển khoản'
        },
        {
          type: 'list',
          items: [
            'Bạn có thể chuyển khoản qua mã QR VNPAY hoặc tài khoản ngân hàng.',
            'Nội dung chuyển khoản: Số điện thoại mua hàng + Mã đơn hàng. Ví dụ 0939907782_19xxxxxxx.',
            'Sau khi chuyển khoản, chụp màn hình giao dịch và gửi qua Zalo OA / Fanpage để xác nhận đơn nhanh chóng.'
          ]
        },
        {
          type: 'note',
          text: 'Sau khi xác nhận giao dịch, trong vòng tối đa 12 tiếng tư vấn viên Hoa Theo Mùa sẽ gọi điện xác nhận và bắt đầu chuẩn bị đơn hoa của bạn.'
        }
      ]
    },
    {
      number: '05',
      icon: BankIcon,
      title: 'Tài khoản chuyển khoản chính thức',
      intro:
        'Hoa Theo Mùa chỉ sử dụng tài khoản dưới đây để nhận thanh toán. Chúng tôi không chịu trách nhiệm với các giao dịch ngoài hai tài khoản này.',
      blocks: [
        {
          type: 'subheading',
          text: 'Doanh nghiệp / cá nhân cần xuất hoá đơn'
        },
        {
          type: 'list',
          items: [
            'SHINHAN - Ngân hàng Shinhan Bank Việt Nam.',
            'Chủ tài khoản: Ho Kinh Doanh Hoa Theo Mua.',
            'Số tài khoản: 700037330511.'
          ]
        },
        {
          type: 'subheading',
          text: 'Doanh nghiệp / cá nhân không cần xuất hoá đơn'
        },
        {
          type: 'list',
          items: [
            'SHINHAN - Ngân hàng Shinhan Bank Việt Nam.',
            'Chủ tài khoản: Ho Kinh Doanh Hoa Theo Mua.',
            'Số tài khoản: 700037330511.'
          ]
        }
      ]
    },
    {
      number: '06',
      icon: Money03Icon,
      title: 'Thanh toán tại cửa hàng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nếu thuận tiện, bạn có thể đến trực tiếp cửa hàng để thanh toán:'
        },
        {
          type: 'list',
          items: [
            'Địa chỉ: 108/3 Đào Duy Anh, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh.',
            'Giờ hoạt động: 07h00 – 18h00 (Thứ 2 – Chủ Nhật).'
          ]
        }
      ]
    },
    {
      number: '07',
      icon: InvoiceIcon,
      title: 'Hoá đơn & chứng từ',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sau khi nhận được thanh toán, Hoa Theo Mùa sẽ xuất hoá đơn hoặc chứng từ và gửi qua email theo yêu cầu của bạn trong quá trình mua hàng.'
        }
      ]
    },
    {
      icon: QrCodeIcon,
      title: 'Lưu ý khi chuyển khoản',
      blocks: [
        {
          type: 'list',
          items: [
            'Vui lòng kiểm tra kỹ tên tài khoản và số tài khoản trước khi chuyển.',
            'Ghi đúng nội dung chuyển khoản giúp Hoa Theo Mùa xử lý đơn nhanh và chính xác.',
            'Nếu chưa nhận được xác nhận trong 12 tiếng, liên hệ ngay hotline 0931 734 353 để được hỗ trợ.'
          ]
        }
      ]
    },
    {
      icon: Search01Icon,
      title: 'Theo dõi tình trạng đơn hàng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sau khi đơn được xác nhận, bạn có thể đăng nhập tài khoản tại hoatheomua.com để theo dõi tình trạng đơn. Tư vấn viên cũng sẽ cập nhật chủ động qua tin nhắn / cuộc gọi nếu có thay đổi.'
        }
      ]
    },
    {
      icon: Discount01Icon,
      title: 'Mẹo nhận ưu đãi',
      blocks: [
        {
          type: 'paragraph',
          text: 'Theo dõi Fanpage và đăng ký nhận tin để cập nhật ưu đãi mới nhất. Khách hàng đăng nhập tài khoản sẽ tự động nhận mã giảm giá đặc biệt vào các dịp lễ và sinh nhật.'
        }
      ]
    },
    {
      icon: CheckmarkCircle02Icon,
      title: 'Hoàn tất đơn hàng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sau khi đặt hàng thành công, màn hình website sẽ hiển thị "Cảm ơn bạn. Đơn hàng của bạn đã được nhận". Đó là dấu hiệu Hoa Theo Mùa đã ghi nhận đơn của bạn và sẵn sàng vào quy trình sản xuất – giao nhận.'
        },
        {
          type: 'note',
          text: 'Cảm ơn quý khách đã sử dụng dịch vụ Hoa Theo Mùa. Để tư vấn thêm vui lòng liên hệ hotline 0931 734 353.'
        }
      ]
    },
    {
      icon: TicketStarIcon,
      title: 'Đặt hoa số lượng lớn',
      blocks: [
        {
          type: 'paragraph',
          text: 'Với các đơn doanh nghiệp, sự kiện hoặc nhu cầu đặc biệt, Hoa Theo Mùa có gói tư vấn riêng. Hãy gửi yêu cầu qua trang Liên hệ hoặc hotline 0931 734 353 - đội ngũ florist sẽ thiết kế đơn hoa trọn gói cho bạn.'
        }
      ]
    }
  ],
  en: [
    {
      icon: InternetIcon,
      title: 'Three ways to place an order',
      blocks: [
        {
          type: 'paragraph',
          text: 'No need to visit a store - order from Hoa Theo Mua online through any channel below. A concierge guides you all the way to make sure the arrangement is exactly what you dreamed of.'
        }
      ]
    },
    {
      number: '01',
      icon: ShoppingBasket03Icon,
      title: 'Option 1 - Order on the website',
      intro: 'Visit hoatheomua.com and follow these steps:',
      blocks: [
        {
          type: 'subheading',
          text: 'Step 1 - Find the product'
        },
        {
          type: 'list',
          items: [
            'Use the navigation menu to filter by product line.',
            'Select the bouquet that matches the occasion and your taste.'
          ]
        },
        {
          type: 'subheading',
          text: 'Step 2 - Add to cart'
        },
        {
          type: 'list',
          items: ['Click the product, choose colour and size.', 'Hit "Buy" then "View cart" to review your order.']
        },
        {
          type: 'subheading',
          text: 'Step 3 - Apply offer & choose payment'
        },
        {
          type: 'list',
          items: [
            'Enter a PROMO CODE (if any), tap "Apply", then "Proceed to checkout".',
            'Fill in your details and add a note if needed (e.g. office-hours delivery, 2-hour rush).',
            'Choose your payment method and tap "Place order" to finish.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: CallIcon,
      title: 'Option 2 - Order by hotline',
      blocks: [
        {
          type: 'paragraph',
          text: 'Call our hotline 0931 734 353 between 8:00 AM and 5:30 PM. The Hoa Theo Mua team is always ready to help you choose the perfect arrangement.'
        }
      ]
    },
    {
      number: '03',
      icon: Facebook01Icon,
      title: 'Option 3 - Order via Facebook',
      blocks: [
        {
          type: 'subheading',
          text: 'Step 1 - Visit our fanpages'
        },
        {
          type: 'list',
          items: [
            'Hoa Theo Mua: facebook.com/lancaocapmokar',
            'Mokar Orchids - Premium Phalaenopsis: facebook.com/lancaocapmokar'
          ]
        },
        {
          type: 'subheading',
          text: 'Step 2 - Message our concierge'
        },
        {
          type: 'paragraph',
          text: 'Pick the arrangement you like and send a message to discuss design, delivery timing, and payment details with our concierge.'
        }
      ]
    },
    {
      number: '04',
      icon: Wallet01Icon,
      title: 'Payment methods',
      intro: 'Hoa Theo Mua supports two flexible ways to pay:',
      blocks: [
        {
          type: 'subheading',
          text: 'Cash on delivery (COD)'
        },
        {
          type: 'paragraph',
          text: 'Pay in cash directly to our courier when your order arrives - best for inspections you want to do in person.'
        },
        {
          type: 'subheading',
          text: 'Bank transfer'
        },
        {
          type: 'list',
          items: [
            'Transfer via the VNPAY QR code or a direct bank transfer.',
            'Reference: your phone number + order code, e.g. 0939907782_19xxxxxxx.',
            'After transferring, take a screenshot and send it on Zalo OA / Facebook so we can confirm quickly.'
          ]
        },
        {
          type: 'note',
          text: 'After confirming the transfer, our concierge will reach out within 12 hours to verify your details and start preparing your order.'
        }
      ]
    },
    {
      number: '05',
      icon: BankIcon,
      title: 'Official bank accounts',
      intro:
        'Hoa Theo Mua only receives payments through the accounts below. We are not responsible for transfers made to any other account.',
      blocks: [
        {
          type: 'subheading',
          text: 'Businesses or individuals needing an invoice'
        },
        {
          type: 'list',
          items: [
            'SHINHAN - Shinhan Bank Vietnam.',
            'Account holder: Ho Kinh Doanh Hoa Theo Mua.',
            'Account number: 700037330511.'
          ]
        },
        {
          type: 'subheading',
          text: 'Businesses or individuals without invoice requirements'
        },
        {
          type: 'list',
          items: [
            'SHINHAN - Shinhan Bank Vietnam.',
            'Account holder: Ho Kinh Doanh Hoa Theo Mua.',
            'Account number: 700037330511.'
          ]
        }
      ]
    },
    {
      number: '06',
      icon: Money03Icon,
      title: 'In-store payment',
      blocks: [
        {
          type: 'paragraph',
          text: 'If it is more convenient, stop by our flagship store to pay in person:'
        },
        {
          type: 'list',
          items: [
            'Address: 108/3 Dao Duy Anh, Ward 9, Phu Nhuan District, Ho Chi Minh City.',
            'Opening hours: 7:00 AM to 6:00 PM (Monday to Sunday).'
          ]
        }
      ]
    },
    {
      number: '07',
      icon: InvoiceIcon,
      title: 'Invoices & receipts',
      blocks: [
        {
          type: 'paragraph',
          text: 'After receiving your payment, Hoa Theo Mua issues an invoice or receipt and sends it by email if requested during checkout.'
        }
      ]
    },
    {
      icon: QrCodeIcon,
      title: 'Bank transfer tips',
      blocks: [
        {
          type: 'list',
          items: [
            'Double-check the beneficiary name and number before transferring.',
            'Use the correct reference so we can match the payment to your order quickly.',
            'If you do not receive confirmation within 12 hours, call hotline 0931 734 353 for support.'
          ]
        }
      ]
    },
    {
      icon: Search01Icon,
      title: 'Track your order',
      blocks: [
        {
          type: 'paragraph',
          text: 'Once confirmed, log in to your account on hoatheomua.com to track order status. Our concierge will also reach out by message or call if anything changes.'
        }
      ]
    },
    {
      icon: Discount01Icon,
      title: 'Tips to unlock offers',
      blocks: [
        {
          type: 'paragraph',
          text: 'Follow our fanpages and subscribe to email updates to receive the latest promotions. Account holders receive personalised vouchers on holidays and birthdays.'
        }
      ]
    },
    {
      icon: CheckmarkCircle02Icon,
      title: 'Order complete',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you see the confirmation message "Thank you. Your order has been received", Hoa Theo Mua has recorded your order and is ready to begin production and delivery.'
        },
        {
          type: 'note',
          text: 'Thank you for choosing Hoa Theo Mua. For more support, please call hotline 0931 734 353.'
        }
      ]
    },
    {
      icon: TicketStarIcon,
      title: 'Bulk and corporate orders',
      blocks: [
        {
          type: 'paragraph',
          text: 'For corporate, event, or special requests, Hoa Theo Mua offers tailored packages. Reach out via the Contact page or hotline 0931 734 353 - our florists will design an end-to-end solution for you.'
        }
      ]
    }
  ]
}
