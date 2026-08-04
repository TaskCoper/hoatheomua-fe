# Lộ trình SEO & Performance

Tài liệu này liệt kê các việc **đã làm**, **phải làm tiếp**, và **nên làm** để site lên top tìm kiếm và đạt Core Web Vitals tốt. Mỗi mục có lý do, mức ưu tiên, và snippet code mẫu.

> Ký hiệu: ✅ = đã xong, 🔥 = bắt buộc, ⚡ = ưu tiên cao, 💡 = nice-to-have.

---

## Bảng tổng hợp rendering từng trang

| Route                                  | Hiện tại                               | Đề xuất                                   | Lý do                                                |
| -------------------------------------- | -------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `/` (home)                             | ?                                      | **SSG** + `revalidate = 3600`             | Trang trademark, nội dung ổn định, cần TTFB cực thấp |
| `/products`                            | ✅ ISR 10 phút + `ItemList` JSON-LD    | giữ nguyên                                | OK                                                   |
| `/products/[id]`                       | ✅ ISR + `generateStaticParams` top 50 | giữ nguyên, **thêm on-demand revalidate** | Khi CMS cập nhật giá, không phải đợi 1 giờ           |
| `/about`                               | ?                                      | **SSG** (static)                          | Ít khi thay đổi                                      |
| `/contact`                             | ?                                      | **SSG**                                   | Form có thể dùng client island                       |
| `/news`                                | ?                                      | **ISR 5 phút**                            | Nội dung mới thường xuyên                            |
| `/news/[slug]`                         | ?                                      | **ISR + `generateStaticParams`**          | Tin cũ ít đổi, có thể build sẵn                      |
| `/recruitment`                         | ?                                      | **ISR 30 phút**                           | Job đăng/đóng định kỳ                                |
| `/sign-in`, `/sign-up`, `/dashboard/*` | dynamic                                | giữ nguyên                                | Cá nhân hoá, không cần SEO                           |

---

## ✅ ĐÃ HOÀN THÀNH (branch `feat/21-products-page`)

### a. Ảnh sản phẩm được optimize qua `next/image`

`next.config.ts` đã whitelist `pos.nvncdn.com`:

```ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'pos.nvncdn.com' }],
  formats: ['image/avif', 'image/webp'],
  qualities: [50, 55, 65, 70, 75],
  deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30
}
```

`ProductCard` và `ProductGallery` đã bỏ `unoptimized`. Mọi ảnh đi qua `/_next/image` → AVIF/WebP + responsive variants. Ảnh chính của detail page có `priority + fetchPriority='high'`.

### b. JSON-LD `Product` đầy đủ trường rich snippet

`/products/[id]/page.tsx` đã có:

- `url`, `sku`, `mpn`, `category`, `inLanguage`
- `image`: mảng URL tuyệt đối (avatar + others)
- `offers.priceValidUntil`, `offers.availability`, `offers.itemCondition: NewCondition`
- `BreadcrumbList` locale-aware

### c. JSON-LD `CollectionPage` + `ItemList`

`/products/page.tsx` build `ItemList` từ `initialItems` (12 sản phẩm trang 1). `CollectionPage.mainEntity` trỏ về `ItemList` qua `@id`.

### d. Heading hierarchy chuẩn

- `/products`: 1 `<h1>` ở hero ("Bộ Sưu Tập Hoa Tươi"). Section "Hoa Theo Từng Dịp" và "Tuyển Chọn Hôm Nay" đã đổi sang `<h2>`.
- `/products/[id]`: 1 `<h1>` ở `ProductSummary` (tên sản phẩm).

### e. Meta description truncate ≤155 ký tự

`/products/[id]/page.tsx` strip HTML → collapse whitespace → cắt ở 155 ký tự (giữ câu nguyên vẹn, thêm `…`).

### f. `SITE_URL` có fallback ở mọi nơi

Trước đây `/products/[id]/page.tsx` để `process.env.NEXT_PUBLIC_SITE_URL` không fallback → JSON-LD có thể chứa `undefined/products/123`. Đã sửa.

### g. Dedupe metadata + page fetch qua `React.cache()`

`safeFetchProduct` wrap bằng `cache()` → metadata và page chia sẻ 1 lệnh fetch network duy nhất, kể cả khi response là `null`.

### h. Robots cho trang 404

Khi `safeFetchProduct(id)` trả null, metadata trả về `robots: { index: false, follow: true }` → search engine không index URL 404.

### i. `next/font` với `display: 'swap'`

`app/[locale]/layout.tsx` đã dùng `Be_Vietnam_Pro` + `Playfair_Display` qua `next/font/google`, subset `latin` + `vietnamese`, swap để tránh FOIT.

---

## 🔥 BẮT BUỘC

### 1. `app/sitemap.ts` - Sitemap động

Site chưa có sitemap. Google sẽ crawl chậm và bỏ sót page detail.

```ts
// app/sitemap.ts
import { fetchTopProductIds } from '@/features/products/products-server'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/products', '/about', '/contact', '/news', '/recruitment']
  const productIds = await fetchTopProductIds(500, { revalidate: 3600 })

  const staticEntries = staticPaths.flatMap((path) => [
    {
      url: `${SITE_URL}${path}`,
      alternates: { languages: { vi: `${SITE_URL}${path}`, en: `${SITE_URL}/en${path}` } }
    },
    { url: `${SITE_URL}/en${path}` }
  ])

  const productEntries = productIds.map((id) => ({
    url: `${SITE_URL}/products/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: { languages: { vi: `${SITE_URL}/products/${id}`, en: `${SITE_URL}/en/products/${id}` } }
  }))

  return [...staticEntries, ...productEntries]
}
```

### 2. `app/robots.ts`

```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/sign-in', '/sign-up', '/verify', '/api'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}
```

### 3. Organization + Website JSON-LD ở root layout

Đặt **một lần** ở `app/[locale]/layout.tsx`. Các `@id` reference (`#organization`, `#website`) trong JSON-LD của products page đã trỏ về đây - nhưng node mục tiêu chưa tồn tại.

```tsx
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Hoa Theo Mùa',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      sameAs: ['https://www.facebook.com/hoatheomua', 'https://www.instagram.com/hoatheomua'],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+84-...',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English']
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Hoa Theo Mùa',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['vi-VN', 'en-US']
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#local-business`,
      name: 'Hoa Theo Mùa',
      address: { '@type': 'PostalAddress', addressLocality: 'Hồ Chí Minh', addressCountry: 'VN' },
      geo: { '@type': 'GeoCoordinates', latitude: 10.776, longitude: 106.7 },
      openingHours: 'Mo-Su 07:00-22:00'
    }
  ]
}
```

Render trong `<head>` qua `<script type='application/ld+json' />`.

### 4. On-demand revalidation cho `/products` và `/products/[id]`

Hiện đợi `revalidate` timeout mới cập nhật → admin sửa giá, khách thấy giá cũ tối đa 1 giờ.

```ts
// app/api/revalidate/products/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { productId } = await req.json()
  revalidatePath('/products')
  if (productId) revalidatePath(`/products/${productId}`)
  return NextResponse.json({ ok: true })
}
```

Cấu hình webhook Nhanh.vn gọi endpoint này khi sản phẩm thay đổi.

---

## ⚡ ƯU TIÊN CAO

### 5. Áp dụng cùng pattern cho `/news`

Tin tức cần SEO mạnh (long-tail keyword):

- `news/page.tsx`: ISR 5 phút, fetch trang 1 server, JSON-LD `CollectionPage` + `ItemList`
- `news/[slug]/page.tsx`: `generateStaticParams` 100 bài gần nhất, JSON-LD `Article`

```tsx
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  image: article.coverImage,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: { '@type': 'Person', name: article.author },
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${article.slug}` },
  inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US'
}
```

### 6. OG image động cho news + product

Hiện product detail dùng ảnh sản phẩm cho OG ✅.
News slug chưa làm - nên dùng `next/og` để overlay tiêu đề lên ảnh nền.

```tsx
// app/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Hoa Theo Mùa'
  return new ImageResponse(
    <div
      style={
        {
          /* ... */
        }
      }
    >
      {title}
    </div>,
    { width: 1200, height: 630 }
  )
}
```

### 7. Schema.org `Product` - bổ sung `aggregateRating` + `review`

```ts
aggregateRating: { '@type': 'AggregateRating', ratingValue: 4.8, reviewCount: 124 },
review: [
  {
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: 5 },
    author: { '@type': 'Person', name: 'Nguyễn A' },
    reviewBody: 'Hoa tươi, giao nhanh.'
  }
]
```

→ Google hiển thị rich snippet 5 sao trong SERP, CTR tăng ~30%. Cần data review trước.

### 8. Lazy load `motion/react` ở component non-critical

`motion/react` ~30KB gzipped. Hero animation, FloatingPetals không phải critical path.

```tsx
const FloatingPetals = dynamic(() => import('./floating-petals'), { ssr: false, loading: () => null })
```

`ProductsContent` đã dynamic-import `FloatingPetals` ✅. Tiếp tục audit:

- `ProductsHeroSection` còn dùng motion stagger nặng
- `ProductCard` motion variants ở mỗi item - cân nhắc CSS animation cho hover effect

---

## 💡 NICE-TO-HAVE

### 9. Core Web Vitals tracking

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
;<SpeedInsights />
```

Mục tiêu:

- **LCP** < 2.5s (ảnh sản phẩm chính trên detail page, ảnh banner trên hero)
- **INP** < 200ms
- **CLS** < 0.1 (ảnh đã có `aspect-square` parent → không bị shift)

### 10. Streaming với `loading.tsx`

```tsx
// app/[locale]/(public)/products/loading.tsx
import ProductGridSkeleton from './_components/product-grid-skeleton'

export default function Loading() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-10'>
      <ProductGridSkeleton count={12} />
    </div>
  )
}
```

### 11. Suspense boundary cho phần dynamic

```tsx
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductGrid initialItems={...} />
</Suspense>
```

Hiện không cần thiết vì server fetch là synchronous trong page render; chỉ cần khi có nested async component slower.

### 12. Bundle audit

```bash
pnpm build
```

Xem `First Load JS` mỗi route. Mục tiêu < 150KB.

- Animation phức tạp → CSS hoặc dynamic import
- Icon library: HugeIcons OK nhưng kiểm tra tree-shaking
- `@radix-ui/*` cần `optimizePackageImports` (đã có trong `next.config.ts`)

### 13. HTTP cache headers cho asset tĩnh

```ts
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    },
    {
      source: '/_next/image',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }]
    }
  ]
}
```

### 14. Pagination deep-link

`/products` đang dùng cursor stack trong `useState` → không có URL state. Nếu muốn SEO trang 2+ và shareable URL, đổi sang `useSearchParams`:

```tsx
const router = useRouter()
const cursor = Number(searchParams.get('cursor') ?? 0)
```

→ Mỗi trang có URL riêng, có thể được crawl. Trade-off: thêm complexity, có thể thêm canonical về trang 1.

---

## Checklist triển khai

Theo thứ tự ưu tiên:

- [x] ✅ Ảnh sản phẩm optimize qua `next/image` (bỏ `unoptimized`)
- [x] ✅ JSON-LD `Product` + `Offer` + `BreadcrumbList` + `ItemList` đầy đủ
- [x] ✅ 1 `<h1>` per page (demote h1 dư về h2)
- [x] ✅ Meta description ≤155 ký tự + `SITE_URL` fallback
- [x] ✅ `React.cache()` dedupe metadata + page fetch
- [x] ✅ Robots `noindex` cho 404 product page
- [x] ✅ `next/font` với `display: 'swap'`
- [ ] 🔥 Tạo `app/sitemap.ts`
- [ ] 🔥 Tạo `app/robots.ts`
- [ ] 🔥 Đặt Organization + WebSite + LocalBusiness JSON-LD ở root layout
- [ ] 🔥 API route `revalidate/products` + webhook từ CMS
- [ ] ⚡ Áp dụng pattern ISR + JSON-LD cho `/news` và `/news/[slug]`
- [ ] ⚡ OG image động qua `next/og` cho news + product (overlay tiêu đề)
- [ ] ⚡ `aggregateRating` + `review` vào Product JSON-LD khi có data
- [ ] ⚡ Lazy load `motion/react` ở component non-critical
- [ ] 💡 Cài Speed Insights, set target Core Web Vitals
- [ ] 💡 `loading.tsx` cho mỗi route công khai
- [ ] 💡 Phân tích bundle size, audit `First Load JS`
- [ ] 💡 Header `Cache-Control` cho static assets
- [ ] 💡 Pagination deep-link nếu cần SEO trang 2+

---

## Cách đo lường

1. **Google Search Console** - impressions, clicks, position. Submit `sitemap.xml`.
2. **PageSpeed Insights** - chạy mỗi route công khai, mục tiêu mobile score > 90.
3. **Rich Results Test** - paste URL, check rich snippet hiển thị đúng (Product card, breadcrumb, sitelinks).
4. **Vercel Analytics** - Core Web Vitals dashboard nếu deploy Vercel.
5. **`pnpm build`** - `First Load JS` và size từng route.

---

## Đường tắt: 1 ngày để có "móng" SEO

Nếu chỉ có thời gian cho 1 sprint, làm các mục 🔥:

1. Sitemap + robots (30 phút)
2. Root JSON-LD Organization/WebSite/LocalBusiness (30 phút)
3. On-demand revalidate API (1 giờ)
4. Webhook từ Nhanh.vn gọi API (tuỳ CMS, 1-2 giờ)

→ Sau 1 ngày: site đầy đủ móng SEO, chỉ còn việc tối ưu chi tiết.
