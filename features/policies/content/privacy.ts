import type { PolicySectionData } from '@/features/policies/components/policy-section'
import type { Locale } from '@/lib/i18n/routing'
import {
  Building03Icon,
  CloudIcon,
  ContactBookIcon,
  Database02Icon,
  Edit02Icon,
  EyeIcon,
  Folder01Icon,
  Mail01Icon,
  SecurityCheckIcon,
  Shield01Icon,
  UserGroupIcon
} from '@hugeicons/core-free-icons'

export const PRIVACY_CONTENT: Record<Locale, PolicySectionData[]> = {
  vi: [
    {
      number: '00',
      icon: Shield01Icon,
      title: 'Cam kết bảo mật của Hoa Theo Mùa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Cảm ơn bạn đã đến với website Hoa Theo Mùa của Công ty TNHH Hoa Theo Mùa (sau đây gọi là "Công ty" hoặc "Hoa Theo Mùa" hoặc "chúng tôi"). Website hoatheomua.com là website bán hàng trực tuyến được xây dựng và quản lý bởi Công ty TNHH Hoa Theo Mùa.'
        },
        {
          type: 'paragraph',
          text: 'Chính sách bảo mật thông tin là một trong những chính sách mà Hoa Theo Mùa đặc biệt chú trọng khi khách hàng mua hàng tại hệ thống của Công ty.'
        },
        {
          type: 'note',
          text: 'Bạn có thể ghé thăm website mà không cần cung cấp bất kỳ thông tin cá nhân nào. Khi ghé thăm, bạn luôn ở trong tình trạng vô danh trừ khi bạn có tài khoản và đăng nhập bằng tên và mật khẩu của mình.'
        }
      ]
    },
    {
      number: '01',
      icon: EyeIcon,
      title: 'Mục đích & phạm vi thu thập thông tin',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa thu thập thông tin khách hàng nhằm phục vụ các mục đích sau:'
        },
        {
          type: 'list',
          items: [
            'Hỗ trợ khách hàng trong quá trình mua hàng, thanh toán và giao hàng.',
            'Cung cấp thông tin sản phẩm, dịch vụ và hỗ trợ theo yêu cầu.',
            'Gửi thông báo về các chương trình ưu đãi, bộ sưu tập và sản phẩm mới.',
            'Giải quyết các vấn đề phát sinh trong quá trình mua hàng.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: Database02Icon,
      title: 'Phạm vi sử dụng thông tin',
      intro: 'Chúng tôi thu thập thông tin cá nhân khi bạn tiến hành đặt hàng trên website hoatheomua.com, bao gồm:',
      blocks: [
        {
          type: 'list',
          items: ['Họ và tên', 'Địa chỉ email', 'Số điện thoại', 'Địa chỉ giao hàng']
        },
        {
          type: 'subheading',
          text: 'Cách chúng tôi sử dụng thông tin'
        },
        {
          type: 'list',
          items: [
            'Xác nhận và thực hiện các giao dịch tài chính liên quan đến thanh toán trực tuyến.',
            'Kiểm tra dữ liệu tải từ trang web của chúng tôi.',
            'Cải thiện giao diện, nội dung và trải nghiệm sử dụng website.',
            'Nghiên cứu nhân khẩu học của người sử dụng.',
            'Gửi thông tin hữu ích, ưu đãi và cập nhật khi bạn đồng ý nhận.'
          ]
        },
        {
          type: 'paragraph',
          text: 'Chúng tôi có thể chia sẻ tên và địa chỉ cho dịch vụ chuyển phát nhanh hoặc nhà cung cấp để hỗ trợ việc giao hàng. Khi bạn đăng ký làm thành viên, chúng tôi cũng sử dụng thông tin để gửi tin khuyến mãi và tiếp thị — bạn có thể huỷ đăng ký bất kỳ lúc nào.'
        },
        {
          type: 'note',
          text: 'Chi tiết đơn hàng được lưu trữ phục vụ tra cứu, nhưng vì lý do bảo mật, bạn không thể yêu cầu lấy lại thông tin đó. Bạn có thể kiểm tra bằng cách đăng nhập tài khoản của mình.'
        }
      ]
    },
    {
      number: '03',
      icon: CloudIcon,
      title: 'Thời gian lưu trữ thông tin',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dữ liệu cá nhân của Thành viên được lưu trữ cho đến khi có yêu cầu huỷ bỏ hoặc Thành viên tự đăng nhập và thực hiện huỷ bỏ. Trong mọi trường hợp, thông tin sẽ được bảo mật trên máy chủ của hoatheomua.com.'
        }
      ]
    },
    {
      number: '04',
      icon: UserGroupIcon,
      title: 'Người hoặc tổ chức có thể tiếp cận thông tin',
      blocks: [
        {
          type: 'list',
          items: [
            'Đơn vị vận chuyển: nhận tên, địa chỉ và số điện thoại để phục vụ giao nhận hàng hoá.',
            'Nhân viên Công ty: bộ phận chuyên trách phục vụ chăm sóc khách hàng trong suốt quá trình sử dụng dịch vụ.',
            'Đối tác liên kết, đồng thực hiện hoặc thuê ngoài: luôn áp dụng yêu cầu bảo mật thông tin cá nhân.',
            'Yêu cầu pháp lý: chúng tôi có thể tiết lộ thông tin nếu luật pháp yêu cầu và cần thiết.',
            'Chuyển giao kinh doanh: trường hợp sáp nhập, người mua sẽ có quyền truy cập thông tin được lưu trữ.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: Building03Icon,
      title: 'Đơn vị thu thập & quản lý thông tin',
      blocks: [
        {
          type: 'list',
          items: [
            'Tên doanh nghiệp: Công ty TNHH Hoa Theo Mùa.',
            'Giấy chứng nhận đăng ký doanh nghiệp số 0316581199 do Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh cấp ngày 06/06/2022.',
            'Trụ sở chính: 108/3 Đào Duy Anh, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh.'
          ]
        }
      ]
    },
    {
      number: '06',
      icon: Edit02Icon,
      title: 'Tiếp cận & chỉnh sửa thông tin',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nếu bạn có bất kỳ yêu cầu nào về việc tiếp cận hoặc chỉnh sửa thông tin cá nhân đã cung cấp, vui lòng liên hệ:'
        },
        {
          type: 'list',
          items: ['Hotline: 0931 734 353', 'Email: mkt.hoatheomua@gmail.com']
        }
      ]
    },
    {
      number: '07',
      icon: SecurityCheckIcon,
      title: 'Cơ chế tiếp nhận & giải quyết khiếu nại',
      blocks: [
        {
          type: 'paragraph',
          text: 'Tại website hoatheomua.com, việc bảo vệ thông tin cá nhân của bạn là rất quan trọng. Hoa Theo Mùa cam kết không chia sẻ, bán hoặc cho thuê thông tin cá nhân cho bất kỳ bên thứ ba nào.'
        },
        {
          type: 'subheading',
          text: 'Hoa Theo Mùa chỉ sử dụng thông tin trong các trường hợp:'
        },
        {
          type: 'list',
          items: [
            'Nâng cao chất lượng dịch vụ dành cho khách hàng.',
            'Giải quyết các tranh chấp, khiếu nại liên quan đến đơn hàng.',
            'Khi cơ quan pháp luật có yêu cầu chính thức.'
          ]
        },
        {
          type: 'note',
          text: 'Nếu có thắc mắc, góp ý liên quan đến chính sách bảo mật hoặc nghi ngờ thông tin bị sử dụng sai mục đích, vui lòng liên hệ hotline 0931 734 353 hoặc email mkt.hoatheomua@gmail.com để được hỗ trợ trực tiếp.'
        }
      ]
    },
    {
      number: '08',
      icon: Folder01Icon,
      title: 'Bảo vệ tài khoản của bạn',
      blocks: [
        {
          type: 'paragraph',
          text: 'Bạn cần bảo đảm rằng tài khoản và mật khẩu của mình được truy cập một cách bí mật và không làm lộ cho bên thứ ba. Chúng tôi không chịu trách nhiệm đối với việc sử dụng sai mật khẩu trừ khi đó là lỗi của chúng tôi.'
        }
      ]
    },
    {
      number: '09',
      icon: ContactBookIcon,
      title: 'Liên hệ hỗ trợ',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mọi góp ý và thông tin hỗ trợ, vui lòng liên hệ hotline 0931 734 353 hoặc email sale.hoatheomua@gmail.com. Cảm ơn quý khách luôn tin tưởng sử dụng dịch vụ và sản phẩm của Hoa Theo Mùa!'
        }
      ]
    }
  ],
  en: [
    {
      number: '00',
      icon: Shield01Icon,
      title: 'Our commitment to privacy',
      blocks: [
        {
          type: 'paragraph',
          text: 'Thank you for visiting Hoa Theo Mua, operated by Hoa Theo Mua Company Limited (hereafter the "Company", "Hoa Theo Mua", or "we"). hoatheomua.com is an online retail site built and managed by the Company.'
        },
        {
          type: 'paragraph',
          text: 'Protecting your personal information is a core promise to every customer who shops with us.'
        },
        {
          type: 'note',
          text: 'You may browse the website without providing any personal information. While browsing, you remain anonymous unless you have an account and log in with your username and password.'
        }
      ]
    },
    {
      number: '01',
      icon: EyeIcon,
      title: 'Purpose & scope of data collection',
      intro: 'We collect customer information to support the following purposes:',
      blocks: [
        {
          type: 'list',
          items: [
            'Customer support during ordering, payment and delivery.',
            'Sharing product and service information based on your needs.',
            'Sending updates about promotions, new collections, and product launches.',
            'Resolving issues that may arise during the shopping experience.'
          ]
        }
      ]
    },
    {
      number: '02',
      icon: Database02Icon,
      title: 'How we use the information',
      intro: 'When you place an order on hoatheomua.com we collect:',
      blocks: [
        {
          type: 'list',
          items: ['Full name', 'Email address', 'Phone number', 'Delivery address']
        },
        {
          type: 'subheading',
          text: 'Specifically, we use your information to:'
        },
        {
          type: 'list',
          items: [
            'Verify and process online financial transactions.',
            'Audit data uploaded from our website.',
            'Improve the interface, content and customer experience.',
            'Conduct demographic research on website visitors.',
            'Send useful information or offers when you have opted in.'
          ]
        },
        {
          type: 'paragraph',
          text: 'We may share your name and address with delivery partners or suppliers to fulfil orders. When you register as a member, we may also send marketing communications — you can unsubscribe at any time.'
        },
        {
          type: 'note',
          text: 'Order details are stored for record-keeping but, for security reasons, cannot be requested back from us. You can review them by logging into your account.'
        }
      ]
    },
    {
      number: '03',
      icon: CloudIcon,
      title: 'Data retention',
      blocks: [
        {
          type: 'paragraph',
          text: 'Member data is retained until you request its removal or remove it yourself. In all cases, your information stays protected on the hoatheomua.com servers.'
        }
      ]
    },
    {
      number: '04',
      icon: UserGroupIcon,
      title: 'Who may access your information',
      blocks: [
        {
          type: 'list',
          items: [
            'Delivery partners: receive name, address and phone number to fulfil orders.',
            'Company staff: dedicated teams that handle customer care throughout your journey.',
            'Affiliated, joint or outsourced programs: bound by our personal data protection requirements.',
            'Legal requests: we may disclose information when required by law and reasonably necessary.',
            'Business transfers: in case of mergers, the acquirer may access the stored information.'
          ]
        }
      ]
    },
    {
      number: '05',
      icon: Building03Icon,
      title: 'The entity collecting & managing the data',
      blocks: [
        {
          type: 'list',
          items: [
            'Company name: Hoa Theo Mua Company Limited.',
            'Business registration No. 0316581199 issued by the Ho Chi Minh City Department of Planning and Investment on 06/06/2022.',
            'Headquarters: 108/3 Dao Duy Anh, Ward 9, Phu Nhuan District, Ho Chi Minh City.'
          ]
        }
      ]
    },
    {
      number: '06',
      icon: Edit02Icon,
      title: 'Accessing & updating your information',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you wish to access or update any personal information you have shared, please reach out via:'
        },
        {
          type: 'list',
          items: ['Hotline: 0931 734 353', 'Email: mkt.hoatheomua@gmail.com']
        }
      ]
    },
    {
      number: '07',
      icon: SecurityCheckIcon,
      title: 'Complaint handling mechanism',
      blocks: [
        {
          type: 'paragraph',
          text: 'Protecting your personal information at hoatheomua.com is critical. Hoa Theo Mua commits to never selling, sharing, or renting your data to any third party.'
        },
        {
          type: 'subheading',
          text: 'We only use your information when:'
        },
        {
          type: 'list',
          items: [
            'Improving the quality of services delivered to customers.',
            'Resolving disputes or complaints related to your orders.',
            'A regulatory authority makes a formal request.'
          ]
        },
        {
          type: 'note',
          text: 'For any concern or feedback relating to this policy — or if you suspect your data is being misused — please reach the hotline 0931 734 353 or email mkt.hoatheomua@gmail.com for direct support.'
        }
      ]
    },
    {
      number: '08',
      icon: Folder01Icon,
      title: 'Protecting your account',
      blocks: [
        {
          type: 'paragraph',
          text: 'Please keep your account credentials confidential and never disclose them to unauthorised third parties. We are not liable for password misuse unless it results from our fault.'
        }
      ]
    },
    {
      number: '09',
      icon: Mail01Icon,
      title: 'Reach our support team',
      blocks: [
        {
          type: 'paragraph',
          text: 'For all feedback and support requests, please contact our hotline 0931 734 353 or email sale.hoatheomua@gmail.com. Thank you for trusting Hoa Theo Mua with your service and product needs.'
        }
      ]
    }
  ]
}
