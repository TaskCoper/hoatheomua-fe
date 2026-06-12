import { api, BasePaginationResponse, BaseResponse } from '@/lib/axios'

export interface NewsItem {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  author: string
  publishedAt: string
  readTime: string
  tags: string[]
}

const sampleNews: NewsItem[] = [
  {
    id: 'news-1',
    slug: 'hoa-hong-vang-ve-dep-tinh-te-cho-mua-he',
    title: 'Hoa hồng vàng – vẻ đẹp tinh tế cho mùa hè',
    summary:
      'Khám phá cách chọn hoa hồng vàng, phối màu nhẹ nhàng và lưu ý bảo quản để giữ nét tươi sang trọng mỗi ngày.',
    content: `Hoa hồng vàng luôn được yêu thích bởi sắc thái rực rỡ nhưng vẫn rất tinh tế. Trong bài viết này, Hoa Theo Mùa gợi ý cách kết hợp hoa hồng vàng với lá xanh và cành trắng để tạo điểm nhấn nhẹ nhàng cho bàn tiệc hoặc quà tặng.

Khi cắm hoa hồng vàng, bạn nên chọn cành chắc khỏe và cắt vát gốc để tăng khả năng hút nước. Nước phải được thay sau mỗi 1-2 ngày, đồng thời cắt bớt phần gốc để giúp hoa tươi lâu hơn.

Nếu bạn muốn trang trí không gian, hãy thử kết hợp hoa hồng vàng với chuỗi đèn nhỏ hoặc ruy băng chất liệu lụa để tạo cảm giác ấm áp và sang trọng.`,
    category: 'Cẩm nang',
    author: 'Hoa Theo Mùa',
    publishedAt: '2026-06-08T08:30:00.000Z',
    readTime: '4 phút đọc',
    tags: ['Hoa hồng', 'Mùa hè', 'Trang trí']
  },
  {
    id: 'news-2',
    slug: 'cach-lua-chon-hoa-cuoi-cho-tiec-cuoi-mua-thu',
    title: 'Cách lựa chọn hoa cưới phù hợp cho tiệc mùa thu',
    summary:
      'Bộ sưu tập màu cam đất và trắng kem giúp không gian tiệc cưới mùa thu thêm ấm cúng, lãng mạn và hiện đại.',
    content: `Mùa thu mang đến một bảng màu rất đặc trưng: cam, nâu đất, xanh rêu và trắng kem. Đây là những gam màu tuyệt vời để làm nổi bật chủ đề tiệc cưới nhẹ nhàng mà vẫn ấm áp.

Hoa baby trắng, hoa hồng nhung và các loại lá khô nhẹ nhàng sẽ là lựa chọn hoàn hảo. Hãy thêm vài nhánh cúc nhỏ hoặc quả mọng giả để tạo chiều sâu cho bó hoa và bàn gallery.

Đừng quên chọn bình hoa có chiều cao vừa phải và chú ý ánh sáng tự nhiên khi trang trí, vì điều đó giúp gam màu hoa hiện rõ nhất.`,
    category: 'Xu hướng',
    author: 'Hoa Theo Mùa',
    publishedAt: '2026-06-03T10:15:00.000Z',
    readTime: '5 phút đọc',
    tags: ['Hoa cưới', 'Thu', 'Phong cách']
  },
  {
    id: 'news-3',
    slug: '5-loi-thoi-trong-cham-soc-hoa-tuoi-ma-ban-can-tranh',
    title: '5 lỗi thường gặp khi chăm sóc hoa tươi và cách sửa nhanh',
    summary:
      'Học cách tránh 5 sai lầm phổ biến để bình hoa luôn tươi mới, từ việc thay nước đến vị trí đặt hoa trong nhà.',
    content: `Nếu bạn muốn hoa tươi lâu, hãy tránh đặt bình gần cửa sổ nắng gắt hoặc máy lạnh. Nhiệt độ thay đổi mạnh sẽ khiến cánh hoa nhanh héo.

Một lỗi khác là không cắt lại cuống hoa sau mỗi vài ngày. Việc này giúp hoa hút nước tốt hơn và giữ hoa tươi lâu hơn.

Ngoài ra, không nên dùng nước quá nóng hay quá lạnh, cũng như để hoa cạnh trái cây chín vì khí ethylene sẽ làm hoa héo nhanh hơn.`,
    category: 'Mẹo vặt',
    author: 'Hoa Theo Mùa',
    publishedAt: '2026-05-29T14:20:00.000Z',
    readTime: '3 phút đọc',
    tags: ['Chăm sóc', 'Mẹo', 'Hoa tươi']
  },
  {
    id: 'news-4',
    slug: 'bo-suu-tap-binh-hoa-thanh-lich-cho-phong-khach',
    title: 'Bộ sưu tập bình hoa thanh lịch cho phòng khách',
    summary:
      'Gợi ý những cách cắm hoa với bình gốm và thủy tinh để làm mới không gian phòng khách theo phong cách tối giản.',
    content: `Phòng khách là nơi đầu tiên khách đến nhà nhìn thấy, và bình hoa là điểm nhấn hoàn hảo. Hãy chọn bình có đường nét đơn giản, tông màu trung tính để dễ phối với nội thất.

Bạn có thể dùng hoa lan, hoa lily hoặc hoa tử đinh hương phối cùng cành lá mảnh. Nhóm hoa cao theo chiều dọc sẽ tạo cảm giác sang trọng; còn nếu yêu thích sự mềm mại, bộ cắm thấp tròn sẽ rất phù hợp.

Tinh tế hơn, hãy bổ sung vài nhánh lá dương xỉ hoặc lá bạch đàn để tạo hiệu ứng phóng khoáng và tự nhiên.`,
    category: 'Phong cách',
    author: 'Hoa Theo Mùa',
    publishedAt: '2026-05-25T09:00:00.000Z',
    readTime: '4 phút đọc',
    tags: ['Phòng khách', 'Bình hoa', 'Tối giản']
  }
]

export async function fetchNewsList(): Promise<NewsItem[]> {
  try {
    const response = await api.get<BasePaginationResponse<NewsItem>>('/v1/news', {
      params: {
        pageIndex: 1,
        pageSize: 12
      }
    })

    return response.data.value.items
  } catch (error) {
    return sampleNews
  }
}

export async function fetchNewsItem(slug: string): Promise<NewsItem> {
  try {
    const response = await api.get<BaseResponse<NewsItem>>(`/v1/news/${slug}`)
    return response.data.value
  } catch (error) {
    const fallback = sampleNews.find((item) => item.slug === slug)
    return fallback ?? sampleNews[0]
  }
}

export function formatNewsDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}
