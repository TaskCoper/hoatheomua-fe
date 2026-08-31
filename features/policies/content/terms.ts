import type { PolicySectionData } from '@/features/policies/components/policy-section'
import type { Locale } from '@/lib/i18n/routing'
import {
  AlertCircleIcon,
  BookOpen01Icon,
  Cancel01Icon,
  ContactBookIcon,
  FileEditIcon,
  Globe02Icon,
  Key01Icon,
  Note04Icon,
  Settings02Icon,
  ShieldUserIcon,
  UserGroupIcon
} from '@hugeicons/core-free-icons'

export const TERMS_CONTENT: Record<Locale, PolicySectionData[]> = {
  vi: [
    {
      number: '00',
      icon: BookOpen01Icon,
      title: 'Lời chào từ Hoa Theo Mùa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chào mừng bạn đến với Hoa Theo Mùa (hoatheomua.com). Website này cùng toàn bộ thông tin, nội dung được cung cấp bởi Công ty TNHH Hoa Theo Mùa (sau đây gọi tắt là "Hoa Theo Mùa" hoặc "chúng tôi").'
        },
        {
          type: 'paragraph',
          text: 'Bản Điều khoản Sử dụng này liệt kê các điều kiện và điều khoản áp dụng cho việc bạn truy cập, sử dụng Trang Web và các dịch vụ liên quan.'
        }
      ]
    },
    {
      number: '01',
      icon: FileEditIcon,
      title: 'Điều chỉnh Điều khoản Sử dụng',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa có quyền cập nhật Bản điều khoản bằng cách đăng tải nội dung mới trên Trang Web và xác định thời điểm điều khoản mới có hiệu lực.'
        },
        {
          type: 'note',
          text: 'Việc bạn tiếp tục sử dụng Trang Web sau khi Bản điều khoản được cập nhật được hiểu là bạn đã đồng ý với các thay đổi đó.'
        }
      ]
    },
    {
      number: '02',
      icon: ContactBookIcon,
      title: 'Thông tin liên hệ',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nếu bạn có bất kỳ thắc mắc nào về Bản điều khoản hoặc Trang Web, vui lòng liên hệ với chúng tôi qua các kênh sau:'
        },
        {
          type: 'list',
          items: [
            'Email: hoatheomuaflowers@gmail.com',
            'Trang Liên hệ trên website để gửi câu hỏi nhanh chóng.',
            'Hotline: 0931 734 353 - sẵn sàng hỗ trợ từ 7h00 đến 18h00.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: UserGroupIcon,
      title: 'Đối tượng độc giả',
      blocks: [
        {
          type: 'paragraph',
          text: 'Trang Web hướng đến độc giả là người Việt Nam từ 18 tuổi trở lên và không dành cho đối tượng độc giả là trẻ em dưới 13 tuổi.'
        }
      ]
    },
    {
      number: '04',
      icon: ShieldUserIcon,
      title: 'Quyền riêng tư',
      blocks: [
        {
          type: 'paragraph',
          text: 'Các vấn đề liên quan đến thông tin cá nhân được thu thập trên Trang Web được trình bày chi tiết trong Chính sách bảo mật. Hoa Theo Mùa có quyền điều chỉnh chính sách của mình khi cần thiết.'
        }
      ]
    },
    {
      number: '05',
      icon: Note04Icon,
      title: 'Việc sử dụng nội dung & thông tin',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mọi loại thông tin, lời khuyên, kiến nghị, thư từ, tin nhắn, bình luận, bài viết, văn bản, đồ họa, phần mềm, âm nhạc, âm thanh, hình ảnh, video, dữ liệu và tài liệu khác trên Trang Web (gọi chung là "Nội dung") được sưu tầm và tổng hợp từ nhiều nguồn.'
        },
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa luôn nỗ lực đảm bảo các bài viết chính xác, hoàn thiện và cập nhật. Tuy nhiên, chúng tôi không thể bảo đảm và không chịu trách nhiệm về độ chính xác, hoàn thiện hay mức cập nhật của bất kỳ Nội dung nào.'
        },
        {
          type: 'paragraph',
          text: 'Chúng tôi không chứng thực hay chịu trách nhiệm về sự chính xác, tin cậy của bất kỳ ý kiến, lời khuyên hoặc phát biểu nào xuất hiện trên Trang Web. Hoa Theo Mùa không bắt buộc phải xem trước, chỉnh sửa hoặc loại bỏ bất kỳ Nội dung nào.'
        }
      ]
    },
    {
      number: '06',
      icon: AlertCircleIcon,
      title: 'Miễn trách bảo đảm đối với Trang Web',
      blocks: [
        {
          type: 'paragraph',
          text: 'Trang Web được cung cấp ở tình trạng nguyên vẹn. Hoa Theo Mùa miễn trách cho tất cả các bảo đảm, dù rõ ràng hay ngụ ý, bao gồm khả năng buôn bán, sự phù hợp cho mục đích cụ thể và việc không vi phạm.'
        },
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa không bảo đảm rằng việc truy cập Trang Web sẽ nhanh chóng, bảo mật, không bị ngắt quãng hay không gặp lỗi. Chúng tôi cũng không đảm bảo về kết quả khi sử dụng Trang Web hay tính chính xác, chất lượng, mức độ tin cậy của bất kỳ thông tin nào.'
        }
      ]
    },
    {
      number: '07',
      icon: Key01Icon,
      title: 'Giới hạn trách nhiệm pháp lý',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa không chịu trách nhiệm về hậu quả có liên quan trực tiếp hoặc gián tiếp đến những việc người dùng làm hoặc không làm dựa trên nội dung trên Trang Web.'
        },
        {
          type: 'note',
          text: 'Người dùng tự đánh giá và chấp nhận tất cả nguy cơ liên quan đến việc sử dụng bất kỳ nội dung nào, bao gồm tính chính xác, hoàn thiện và mức độ hữu ích của nội dung đó.'
        }
      ]
    },
    {
      number: '08',
      icon: Settings02Icon,
      title: 'Điều chỉnh & đình chỉ Trang Web',
      blocks: [
        {
          type: 'paragraph',
          text: 'Tại bất kỳ thời điểm nào, Hoa Theo Mùa có thể chỉnh sửa, tạm ngưng hoặc đình chỉ hoạt động của Trang Web hoặc một phần Trang Web tạm thời hay vĩnh viễn mà không cần thông báo trước.'
        }
      ]
    },
    {
      number: '09',
      icon: Cancel01Icon,
      title: 'Chấm dứt hiệu lực',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mỗi bên có quyền chấm dứt hiệu lực của Bản điều khoản vì bất kỳ lý do nào hoặc không có lý do nào tại bất kỳ thời điểm nào bằng cách gửi thông báo. Thông báo có hiệu lực ngay lập tức hoặc tại thời điểm được đề cập.'
        },
        {
          type: 'paragraph',
          text: 'Sau khi chấm dứt, người dùng sẽ không tiếp tục truy cập Trang Web. Các điều khoản có dụng ý tiếp tục có hiệu lực sau khi chấm dứt sẽ vẫn duy trì hiệu lực vĩnh viễn.'
        }
      ]
    },
    {
      number: '10',
      icon: Globe02Icon,
      title: 'Cảm ơn bạn đã đồng hành',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mùa cảm ơn quý khách đã dành thời gian đọc Bản điều khoản. Sự tin tưởng của bạn là động lực để chúng tôi tiếp tục lan toả vẻ đẹp của hoa tươi Việt Nam.'
        }
      ]
    }
  ],
  en: [
    {
      number: '00',
      icon: BookOpen01Icon,
      title: 'Welcome to Hoa Theo Mua',
      blocks: [
        {
          type: 'paragraph',
          text: 'Welcome to Hoa Theo Mua (hoatheomua.com). This website and its content are provided by Hoa Theo Mua Company Limited (hereafter "Hoa Theo Mua" or "we").'
        },
        {
          type: 'paragraph',
          text: 'These Terms of Use describe the conditions that apply to your access to and use of this website and the related services.'
        }
      ]
    },
    {
      number: '01',
      icon: FileEditIcon,
      title: 'Updates to these Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua may amend these Terms by publishing the updated version on the website together with its effective date.'
        },
        {
          type: 'note',
          text: 'By continuing to use the website after an update, you confirm your acceptance of the revised Terms.'
        }
      ]
    },
    {
      number: '02',
      icon: ContactBookIcon,
      title: 'Contact information',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you have any question regarding these Terms or this website, please reach us through:'
        },
        {
          type: 'list',
          items: [
            'Email: hoatheomuaflowers@gmail.com',
            'The Contact page on the website for quick enquiries.',
            'Hotline: 0931 734 353 - available from 7:00 AM to 6:00 PM.'
          ]
        }
      ]
    },
    {
      number: '03',
      icon: UserGroupIcon,
      title: 'Intended audience',
      blocks: [
        {
          type: 'paragraph',
          text: 'This website targets Vietnamese readers aged 18 and above and is not intended for children under 13 years old.'
        }
      ]
    },
    {
      number: '04',
      icon: ShieldUserIcon,
      title: 'Privacy',
      blocks: [
        {
          type: 'paragraph',
          text: 'Matters relating to personal information collected through the website are described in detail in our Privacy Policy. Hoa Theo Mua may amend that policy when necessary.'
        }
      ]
    },
    {
      number: '05',
      icon: Note04Icon,
      title: 'Use of content & information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Any information, advice, recommendation, message, comment, article, text, graphic, software, music, sound, image, video, data and other material on the website (collectively the "Content") may be sourced and curated from various references.'
        },
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua strives to keep the Content accurate, complete and up-to-date. We do not warrant the accuracy, completeness, or freshness of any Content and accept no responsibility for it.'
        },
        {
          type: 'paragraph',
          text: 'We do not endorse, and are not responsible for, the accuracy or reliability of any opinion, advice or statement on the website. Hoa Theo Mua is not obliged to pre-screen, edit, or remove any Content.'
        }
      ]
    },
    {
      number: '06',
      icon: AlertCircleIcon,
      title: 'Disclaimer of warranties',
      blocks: [
        {
          type: 'paragraph',
          text: 'The website is provided on an "as is" basis. Hoa Theo Mua disclaims all warranties, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.'
        },
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua does not warrant that the website will be fast, secure, uninterrupted or error-free, nor does it guarantee the accuracy, quality, or reliability of any information obtained from it.'
        }
      ]
    },
    {
      number: '07',
      icon: Key01Icon,
      title: 'Limitation of liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua is not responsible for consequences, direct or indirect, arising from what users do or fail to do based on the Content of the website.'
        },
        {
          type: 'note',
          text: 'Users assess and accept all risks associated with using any Content, including accuracy, completeness and usefulness.'
        }
      ]
    },
    {
      number: '08',
      icon: Settings02Icon,
      title: 'Modification & suspension of the website',
      blocks: [
        {
          type: 'paragraph',
          text: 'At any time and without notice, Hoa Theo Mua may modify, temporarily suspend, or permanently discontinue the website or any part of it.'
        }
      ]
    },
    {
      number: '09',
      icon: Cancel01Icon,
      title: 'Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'Either party may terminate these Terms for any reason or no reason at any time by notice. The notice takes effect immediately or at the date mentioned in the notice.'
        },
        {
          type: 'paragraph',
          text: 'After termination, the user shall no longer access the website. Provisions intended to survive termination remain in effect indefinitely.'
        }
      ]
    },
    {
      number: '10',
      icon: Globe02Icon,
      title: 'Thank you for choosing us',
      blocks: [
        {
          type: 'paragraph',
          text: 'Hoa Theo Mua thanks you for taking the time to read these Terms. Your trust drives us to keep sharing the beauty of Vietnamese flowers with the world.'
        }
      ]
    }
  ]
}
