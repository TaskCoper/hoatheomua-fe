import type { Job } from './types'

export const jobs: Job[] = [
  {
    id: 'flower-arranger',
    title: 'Nhân viên cắm hoa',
    company: 'Hoa Theo Mùa',
    location: 'Hồ Chí Minh',
    branch: 'Chi nhánh Thảo Điền',
    employmentType: 'Toàn thời gian',
    level: 'Nhân viên',
    salary: '9 - 12 triệu',
    experience: 'Dưới 1 năm',
    postedAt: '2 ngày trước',
    views: '18 lượt xem',
    isNew: true,
    logoText: 'H',
    image: '/images/banner-one.png',
    summary:
      'Gia nhập đội ngũ Hoa Theo Mùa để tạo nên những bó hoa tươi mang cảm xúc tự nhiên, tinh tế và đúng tinh thần của từng khách hàng.',
    responsibilities: [
      'Chuẩn bị hoa, lá phụ, phụ kiện và dụng cụ trước mỗi ca làm việc.',
      'Cắm bó hoa, giỏ hoa và bình hoa theo mẫu có sẵn hoặc yêu cầu đơn giản.',
      'Kiểm tra độ tươi, vệ sinh khu vực thao tác và bảo quản hoa sau khi hoàn thiện.',
      'Phối hợp với bán hàng để điều chỉnh sản phẩm theo ghi chú của khách.'
    ],
    requirements: [
      'Yêu hoa tươi, có thẩm mỹ màu sắc và sự cẩn thận trong thao tác.',
      'Có kinh nghiệm tại shop hoa là lợi thế, chưa có sẽ được hướng dẫn.',
      'Có thể làm việc theo ca và hỗ trợ cuối tuần khi cửa hàng đông khách.'
    ],
    benefits: [
      'Thu nhập ổn định, thưởng theo hiệu quả cửa hàng.',
      'Được đào tạo kỹ thuật cắm hoa và xử lý hoa theo mùa.',
      'Môi trường làm việc nhẹ nhàng, sạch sẽ và nhiều cơ hội học nghề.'
    ]
  },
  {
    id: 'floral-designer',
    title: 'Florist / Floral Designer',
    company: 'Hoa Theo Mùa',
    location: 'Hồ Chí Minh',
    branch: 'Chi nhánh Quận 1',
    employmentType: 'Toàn thời gian',
    level: 'Nhân viên',
    salary: '10 - 15 triệu',
    experience: '1 - 2 năm',
    postedAt: '1 ngày trước',
    views: '32 lượt xem',
    isNew: true,
    logoText: 'H',
    image: '/images/banner-one.png',
    summary:
      'Bạn sẽ cùng chúng tôi kể những câu chuyện bằng hoa, mang cảm xúc và vẻ đẹp thiên nhiên đến với khách hàng qua từng thiết kế tinh tế.',
    responsibilities: [
      'Thiết kế và thực hiện các sản phẩm hoa tươi: bó hoa, giỏ hoa, lẵng hoa theo yêu cầu khách hàng.',
      'Tư vấn ý tưởng, phong cách và lựa chọn hoa phù hợp cho khách hàng.',
      'Đảm bảo chất lượng, thẩm mỹ và tiến độ sản phẩm theo tiêu chuẩn cửa hàng.',
      'Hỗ trợ trưng bày, trang trí không gian cửa hàng và sự kiện.',
      'Phối hợp cùng đội ngũ để triển khai các dự án hoa cưới, lễ cưới, workshop.'
    ],
    requirements: [
      'Đam mê hoa tươi, có gu thẩm mỹ tốt và tinh thần học hỏi.',
      'Kinh nghiệm cắm hoa từ 1 - 2 năm, ưu tiên từng làm tại shop hoa hoặc studio.',
      'Thành thạo các kỹ thuật bó hoa, cắm giỏ, cắm lẵng.',
      'Tỉ mỉ, cẩn thận và có trách nhiệm trong công việc.'
    ],
    benefits: [
      'Thu nhập 10 - 15 triệu/tháng, gồm lương cứng và thưởng doanh số.',
      'Tham gia BHXH đầy đủ, nghỉ lễ theo quy định.',
      'Đào tạo nâng cao tay nghề, tham gia workshop định kỳ.',
      'Môi trường làm việc thẩm mỹ, sáng tạo và ấm áp như một gia đình.'
    ]
  },
  {
    id: 'event-decorator',
    title: 'Chuyên viên trang trí sự kiện',
    company: 'Hoa Theo Mùa',
    location: 'Hà Nội',
    branch: 'Chi nhánh Tây Hồ',
    employmentType: 'Toàn thời gian',
    level: 'Chuyên viên',
    salary: '12 - 18 triệu',
    experience: '2 - 3 năm',
    postedAt: '3 ngày trước',
    views: '24 lượt xem',
    isNew: true,
    logoText: 'E',
    image: '/images/bg.png',
    summary:
      'Vai trò dành cho người yêu không gian, biết biến hoa lá thành điểm nhấn cảm xúc cho tiệc cưới, khai trương và các sự kiện thương hiệu.',
    responsibilities: [
      'Khảo sát địa điểm, lên ý tưởng trang trí hoa cho từng concept sự kiện.',
      'Chuẩn bị vật liệu, phân công đội thi công và theo sát tiến độ lắp đặt.',
      'Làm việc với khách hàng, planner và nhà cung cấp để thống nhất chi tiết setup.',
      'Giám sát tháo dỡ, kiểm kê vật tư và rút kinh nghiệm sau sự kiện.'
    ],
    requirements: [
      'Có kinh nghiệm trang trí sự kiện, hoa cưới hoặc visual merchandising.',
      'Đọc hiểu moodboard, biết phối màu và cân bằng bố cục không gian.',
      'Linh hoạt thời gian, có thể đi công tác ngắn ngày khi cần.'
    ],
    benefits: [
      'Phụ cấp dự án và phụ cấp di chuyển theo từng sự kiện.',
      'Được tham gia các dự án cưới, brand event và workshop lớn.',
      'Lộ trình phát triển lên trưởng nhóm trang trí sự kiện.'
    ]
  },
  {
    id: 'customer-care',
    title: 'Nhân viên chăm sóc khách hàng',
    company: 'Hoa Theo Mùa',
    location: 'Hồ Chí Minh',
    branch: 'Chi nhánh Phú Nhuận',
    employmentType: 'Toàn thời gian',
    level: 'Nhân viên',
    salary: '8 - 11 triệu',
    experience: '6 tháng - 1 năm',
    postedAt: '2 ngày trước',
    views: '21 lượt xem',
    isNew: false,
    logoText: 'C',
    image: '/images/banner-one.png',
    summary:
      'Đồng hành cùng khách hàng từ lúc chọn hoa đến khi món quà được giao tận tay, đảm bảo mọi trải nghiệm đều tinh tế và chu đáo.',
    responsibilities: [
      'Tiếp nhận tin nhắn, cuộc gọi và tư vấn sản phẩm phù hợp với nhu cầu khách hàng.',
      'Xác nhận đơn hàng, ghi chú lời chúc, thời gian giao và yêu cầu đặc biệt.',
      'Theo dõi trạng thái đơn, phối hợp với florist và giao nhận để xử lý phát sinh.',
      'Ghi nhận phản hồi sau mua và đề xuất cải thiện trải nghiệm dịch vụ.'
    ],
    requirements: [
      'Giao tiếp rõ ràng, kiên nhẫn và có tinh thần phục vụ.',
      'Sử dụng tốt máy tính, phần mềm chat và quản lý đơn hàng cơ bản.',
      'Ưu tiên ứng viên từng làm bán lẻ, dịch vụ khách hàng hoặc thương mại điện tử.'
    ],
    benefits: [
      'Thưởng theo chất lượng chăm sóc và phản hồi khách hàng.',
      'Được đào tạo kiến thức sản phẩm hoa tươi và quy trình vận hành cửa hàng.',
      'Không gian làm việc thân thiện, nhiều cơ hội phối hợp cùng đội sáng tạo.'
    ]
  },
  {
    id: 'delivery-coordinator',
    title: 'Điều phối giao hoa',
    company: 'Hoa Theo Mùa',
    location: 'Hồ Chí Minh',
    branch: 'Kho trung tâm Bình Thạnh',
    employmentType: 'Toàn thời gian',
    level: 'Nhân viên',
    salary: '9 - 13 triệu',
    experience: '1 năm',
    postedAt: '1 ngày trước',
    views: '17 lượt xem',
    isNew: true,
    logoText: 'D',
    image: '/images/bg.png',
    summary:
      'Bạn sẽ giữ nhịp cho mỗi đơn hoa được giao đúng giờ, đúng địa chỉ và vẫn giữ được vẻ đẹp trọn vẹn khi đến tay người nhận.',
    responsibilities: [
      'Sắp xếp tuyến giao theo khu vực, thời gian hẹn và mức độ ưu tiên của đơn hàng.',
      'Kiểm tra tình trạng sản phẩm trước khi bàn giao cho shipper.',
      'Theo dõi hành trình giao, cập nhật trạng thái và xử lý tình huống phát sinh.',
      'Tổng hợp dữ liệu giao hàng cuối ngày để tối ưu vận hành.'
    ],
    requirements: [
      'Cẩn thận, phản ứng nhanh và có khả năng sắp xếp công việc tốt.',
      'Biết sử dụng bản đồ, bảng tính và công cụ quản lý đơn cơ bản.',
      'Có kinh nghiệm điều phối giao nhận là lợi thế.'
    ],
    benefits: [
      'Phụ cấp điện thoại và thưởng theo tỷ lệ giao đúng hẹn.',
      'Được đào tạo quy trình đóng gói, bảo quản hoa trong quá trình vận chuyển.',
      'Ca làm rõ ràng, phối hợp trực tiếp với cửa hàng và đội giao nhận.'
    ]
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    company: 'Hoa Theo Mùa',
    location: 'Hồ Chí Minh',
    branch: 'Văn phòng sáng tạo',
    employmentType: 'Toàn thời gian',
    level: 'Chuyên viên',
    salary: '11 - 16 triệu',
    experience: '1 - 2 năm',
    postedAt: '5 ngày trước',
    views: '29 lượt xem',
    isNew: false,
    logoText: 'M',
    image: '/images/banner-one.png',
    summary:
      'Cùng xây dựng câu chuyện thương hiệu Hoa Theo Mùa qua hình ảnh, bài viết và những nội dung giàu cảm xúc về hoa, mùa và lối sống.',
    responsibilities: [
      'Lên kế hoạch nội dung cho Facebook, Instagram, TikTok và website theo từng mùa hoa.',
      'Viết caption, kịch bản ngắn, bài blog và nội dung giới thiệu bộ sưu tập.',
      'Phối hợp với florist để ghi lại hậu trường, sản phẩm mới và câu chuyện khách hàng.',
      'Theo dõi hiệu quả nội dung, đề xuất góc kể chuyện và định dạng mới.'
    ],
    requirements: [
      'Có khả năng viết tiếng Việt giàu cảm xúc, tinh gọn và đúng giọng thương hiệu.',
      'Biết chụp ảnh/quay dựng cơ bản bằng điện thoại hoặc máy ảnh là lợi thế.',
      'Yêu thích hoa, thẩm mỹ đời sống và các nội dung thủ công sáng tạo.'
    ],
    benefits: [
      'Ngân sách sản xuất nội dung và cơ hội thử nghiệm định dạng mới.',
      'Làm việc gần đội florist, stylist và photographer của thương hiệu.',
      'Thưởng theo chiến dịch và hiệu quả nội dung nổi bật.'
    ]
  }
]
