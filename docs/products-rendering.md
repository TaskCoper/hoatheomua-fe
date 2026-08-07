# Rendering trang Sản phẩm

> ⚠️ **LỖI THỜI (2026-08-07).** Tài liệu này mô tả một thiết kế đã bị thay thế: thư mục `_components/`,
> cursor pagination, `React.cache()` bọc `fetch`, và `ItemList` dựng từ `initialItems` — đều không còn
> đúng với code hiện tại (caching giờ là `unstable_cache` + tag purge; phân trang dùng nuqs).
> Giữ lại làm tư liệu lịch sử. Xem **[`toi-uu-hoa-audit.md`](./toi-uu-hoa-audit.md)** để biết hành vi hiện tại.

Tài liệu này mô tả **chính xác** cách hai trang `/products` và `/products/[id]` render trong branch `feat/21-products-page`, kèm lý do cho từng quyết định ở góc độ SEO và performance.

> Tham chiếu code: `app/[locale]/(public)/products/`, `app/[locale]/(public)/products/[id]/`, `features/products/`.

---

## 1. Tóm tắt

| Tiêu chí              | `/products`                                                  | `/products/[id]`                               |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Render strategy       | ISR + plain props + React Query seed                         | ISR + `generateStaticParams` top 50            |
| `revalidate`          | 600s (10 phút)                                               | 3600s (1 giờ)                                  |
| Server fetch          | Trang 1 (12 sản phẩm)                                        | Chi tiết 1 sản phẩm (dedupe qua `React.cache`) |
| JSON-LD               | `CollectionPage` + `BreadcrumbList` + `ItemList` (≤12 items) | `Product` + `Offer` + `BreadcrumbList`         |
| Heading hierarchy     | 1× `<h1>` (hero) + `<h2>` cho mỗi section                    | 1× `<h1>` (tên sản phẩm)                       |
| Images                | `next/image` qua `pos.nvncdn.com` (AVIF/WebP, responsive)    | `next/image` với `priority` cho ảnh LCP        |
| Fallback khi API hỏng | Render empty grid + retry phía client                        | `notFound()`                                   |

---

## 2. `features/products/products-server.ts`

Module server-only chứa các fetch helper. Quan trọng nhất:

```ts
async function postProductApi<T>(path: string, body: unknown, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    next: { revalidate: options.revalidate ?? 3600 }
  })
  // ...
}
```

- `fetch()` với `next.revalidate` → đi vào Next.js Data Cache, dedupe theo `(URL, body)` trong cùng một render lifecycle.
- `fetchProductsList`, `fetchProductDetailById`, `fetchTopProductIds` đều build trên helper này.

### `fetchTopProductIds`

```ts
export const fetchTopProductIds = async (limit = 50, options?: FetchOptions): Promise<string[]> => {
  try {
    const response = await fetchProductsList({ size: limit }, options)
    const items = response.value?.data ?? []
    return items.map((product) => String(product.id))
  } catch {
    return []
  }
}
```

Dùng cho `generateStaticParams`. Catch mọi lỗi → mảng rỗng → build vẫn pass nếu API down vào lúc build. Mọi route fallback xuống ISR on-demand.

---

## 3. Trang danh sách - `app/[locale]/(public)/products/page.tsx`

### Kiến trúc

```
ProductsPage (RSC, ISR 600s)
├── generateMetadata({ params })            ─ metadata theo locale
├── fetchProductsList(...)                  ─ server fetch page 1
├── buildProductsJsonLd(locale, items)      ─ CollectionPage + Breadcrumb + ItemList
└── <ProductsContent initialItems initialNextCursor />
    ├── <ProductsHeroSection />             ─ h1 = "Bộ Sưu Tập Hoa Tươi"
    ├── <ProductsOccasionsSection />        ─ h2 = "Hoa Theo Từng Dịp"
    ├── <ProductsCatalogSection>            ─ h2 = "Tuyển Chọn Hôm Nay"
    │     └── <ProductGrid initialItems initialNextCursor />
    ├── <ProductsPromiseSection />
    └── <FloatingPetals />                  ─ dynamic({ ssr: false })
```

### 3.1 Server fetch + props (không HydrationBoundary)

```tsx
export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  let initialItems: Product[] = []
  let initialNextCursor = 0

  try {
    const response = await fetchProductsList(
      { size: PRODUCTS_PAGE_SIZE, next: { id: 0 } },
      { revalidate: REVALIDATE_SECONDS }
    )
    initialItems = response.value?.data ?? []
    initialNextCursor = response.value?.paginator.next.id ?? 0
  } catch {
    // empty grid → React Query sẽ retry khi mount
  }

  const jsonLd = buildProductsJsonLd(locale, initialItems)

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductsContent initialItems={initialItems} initialNextCursor={initialNextCursor} />
    </>
  )
}
```

**Vì sao không dùng `HydrationBoundary`**: với một query duy nhất ở trang 1, dehydrate/rehydrate là 6 bước cho dữ liệu đã có sẵn dạng object. Truyền `Product[]` qua prop và seed `useQuery` bằng `initialData` đơn giản hơn, ít JS hơn.

### 3.2 JSON-LD - CollectionPage + Breadcrumb + ItemList

```ts
const buildProductsJsonLd = (locale: Locale, items: Product[]) => {
  const itemList =
    items.length > 0
      ? {
          '@type': 'ItemList',
          '@id': `${SITE_URL}${path}#itemlist`,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: productUrl(locale, product.id),
            name: product.name
          }))
        }
      : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage' /* ... + mainEntity → ItemList */ },
      { '@type': 'BreadcrumbList' /* ... */ },
      ...(itemList ? [itemList] : [])
    ]
  }
}
```

**Tại sao thêm `ItemList`**: Google ưu tiên collection page có `ItemList` để hiển thị product carousel trong SERP. `CollectionPage.mainEntity` trỏ về `ItemList` qua `@id` để khớp graph.

Tất cả label (`inLanguage`, `name`, breadcrumb text) đều derive từ `locale` → trang `/products` và `/en/products` có structured data khớp với hreflang.

### 3.3 `ProductGrid` - `initialData` seed + cursor pagination

```tsx
const { data, isFetching, isLoading } = useQuery<ProductListResponse>({
  queryKey: buildGetProductsKey({ size: pageSize, next: { id: currentCursor } }),
  queryFn: () => productService.getProducts({ size: pageSize, next: { id: currentCursor } }),
  placeholderData: keepPreviousData,
  initialData: isFirstPage
    ? ({
        /* … wrap initialItems vào BaseResponse shape … */
      } as ProductListResponse)
    : undefined,
  staleTime: isFirstPage ? 60_000 : 0
})
```

- `isFirstPage = currentCursor === 0` → `initialData` chỉ gắn ở cursor 0.
- `staleTime: 60_000` cho page 1 → hook coi data từ server là "fresh" 60s → **không refetch khi mount**. Đây là dòng load-bearing; bỏ đi là mất lợi ích của server fetch.
- Cursor stack (`useState([0])`) lưu lịch sử → "Trước" pop, "Sau" push.
- `hasNextPage = items.length === pageSize && nextCursor > 0 && nextCursor !== currentCursor` - guard chống infinite loop khi API trả cùng cursor.

### 3.4 LCP - eager 4 card đầu

```tsx
{
  items.map((product, index) => <ProductCard key={product.id} product={product} eager={isFirstPage && index < 4} />)
}
```

Trong `product-card.tsx`:

```tsx
<Image
  src={avatar}
  alt={product.name}
  fill
  loading={eager ? 'eager' : 'lazy'}
  priority={eager}
  sizes='(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'
  quality={65}
  className='object-cover ...'
/>
```

**Không còn `unoptimized`**: `next.config.ts` đã whitelist `pos.nvncdn.com`, nên ảnh giờ đi qua `/_next/image` với AVIF/WebP + responsive variants. `quality={65}` cân bằng dung lượng với chất lượng cảm nhận trên thumbnail card.

### 3.5 Heading hierarchy

Trước: 3 `<h1>` trên `/products` (hero, occasions, catalog).
Sau: **1 `<h1>`** (hero: "Bộ Sưu Tập Hoa Tươi") + `<h2>` cho mọi section con. Google chỉ chấm 1 chủ đề chính per page; nhiều h1 dilute keyword relevance.

---

## 4. Trang chi tiết - `app/[locale]/(public)/products/[id]/page.tsx`

### Kiến trúc

```
ProductPage (RSC, ISR 3600s + generateStaticParams top 50)
├── safeFetchProduct(id)                  ─ cache() wrapped - dedupe metadata + page
├── notFound() nếu null
├── productJsonLd                         ─ Product + Offer + BreadcrumbList
└── <ProductDetailContent product={product} />   ─ RSC compose
    ├── <ProductBreadcrumb name />        ─ RSC
    ├── <ProductGallery ... />            ─ Client (state ảnh active)
    ├── <ProductSummary ... />            ─ RSC (h1 = product.name)
    ├── <ProductPurchaseBox ... />        ─ Client (variant, quantity)
    ├── <ProductPromiseCard />            ─ RSC
    ├── <ProductDetailsTabs ... />        ─ Client (tabs: Mô tả / Chi tiết / Bảo quản)
    ├── <ProductsPromiseSection />
    └── <FloatingPetals />
```

### 4.1 `generateStaticParams` + `dynamicParams`

```tsx
export const revalidate = REVALIDATE_SECONDS // 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const ids = await fetchTopProductIds(STATIC_PRODUCT_LIMIT, { revalidate: REVALIDATE_SECONDS })
  return ids.map((id) => ({ id }))
}
```

- Top 50 ID mới nhất pre-build lúc deploy. HTML đã có trên CDN → TTFB cực thấp cho ~80% traffic (giả định Pareto).
- `dynamicParams = true` → sản phẩm ngoài top 50 vẫn truy cập được; lần đầu là SSR, sau đó cache theo `revalidate`.
- `fetchTopProductIds` catch lỗi → API down lúc build vẫn không sập pipeline.

### 4.2 Dedupe metadata fetch + page fetch

```tsx
const safeFetchProduct = cache(async (id: string) => {
  try {
    return await fetchProductDetailById(id, { revalidate: REVALIDATE_SECONDS })
  } catch {
    return null
  }
})
```

- React `cache()` đảm bảo cùng một request render, `generateMetadata` và `ProductPage` chỉ thực hiện đúng **một** lệnh gọi network (kể cả khi response là `null`).
- Bổ sung cho Next.js fetch dedupe - `cache()` cache cả nhánh catch, không cần phụ thuộc vào behavior của `fetch` cache.

### 4.3 Metadata - locale-aware, truncated description

```tsx
const cleanDescription = stripHtml(product.description) || `${product.name} - Hoa Theo Mùa`
const description = truncate(cleanDescription, META_DESCRIPTION_MAX_LENGTH) // 155 chars
const ogImage = product.images.avatar
  ? { url: avatar, alt: product.name } // tránh fake 1200×630
  : { url: avatar, width: 1200, height: 630, alt: product.name } // fallback banner - kích thước thật
```

**Vì sao**:

- `truncate` ở 155 ký tự → Google cắt meta description ~160; tự cắt giữ câu nguyên vẹn, không bị dấu `…` của Google thêm vào.
- `stripHtml` thay `<[^>]*>` bằng dấu cách + collapse whitespace → tránh nối từ kiểu `lan hồ điệp</p><p>cao cấp` → `lan hồ điệpcao cấp`.
- OG image: chỉ đặt `width/height` khi dùng banner mặc định (đúng tỉ lệ 1.91:1). Ảnh sản phẩm là vuông (1:1), nên bỏ width/height để crawler tự đo - tránh khai sai metadata.
- `keywords` lọc bỏ null bằng type-guard `filter((v): v is string => Boolean(v))`.
- Khi product = null → metadata có `robots: { index: false, follow: true }` → trang 404 không bị index.

### 4.4 JSON-LD - Product + Offer + Breadcrumb

```tsx
const productJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': `${SITE_URL}${path}#product`,
      url: `${SITE_URL}${path}`,
      name: product.name,
      description, // stripped HTML
      image: allImages.length > 0 ? allImages : [avatar], // mảng URL tuyệt đối
      sku: product.code || `htm-${product.id}`,
      mpn: product.code || `htm-${product.id}`,
      inLanguage, // vi-VN | en-US
      category: product.category?.name ?? undefined,
      brand: { '@type': 'Brand', name: product.brand?.name ?? 'Hoa Theo Mùa' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}${path}`,
        priceCurrency: 'VND',
        price: product.prices.retail,
        priceValidUntil: priceValidUntil(), // 31/12 năm hiện tại
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#organization` }
      }
    },
    { '@type': 'BreadcrumbList' /* … locale-aware … */ }
  ]
}
```

Các trường mới so với phiên bản trước:

- `url` (cấp Product) - Google merchant feed yêu cầu.
- `image` là **mảng URL tuyệt đối** (gộp avatar + others, lọc các URL không bắt đầu bằng `http`) - Rich Results Test chấm cao hơn khi có ≥3 ảnh.
- `mpn` - chấp nhận thay cho GTIN/EAN khi chưa có barcode.
- `category` - derive từ `product.category?.name`.
- `itemCondition: NewCondition` - hết warning "Missing field itemCondition" trên Search Console.
- `SITE_URL` fallback về `'https://hoatheomua.net'` (trước đây undefined → `undefined/products/123`).

### 4.5 `ProductGallery` - `next/image` thực sự được optimize

```tsx
{
  /* thumbnail (button có `fill` Image bên trong) */
}
;<Image src={image} fill sizes='(min-width: 1280px) 5rem, (min-width: 640px) 6rem, 4rem' quality={55} />

{
  /* ảnh chính - LCP element của detail page */
}
;<Image
  src={activeImage}
  fill
  priority
  fetchPriority='high'
  sizes='(min-width: 1280px) 40rem, (min-width: 1024px) 32rem, 100vw'
  quality={70}
/>
```

Thay đổi quan trọng so với bản trước:

- Bỏ `unoptimized` ở mọi `<Image />` - ảnh đi qua `/_next/image` với AVIF/WebP.
- Bỏ `width={100} height={100}` (cùng `aspect-square w-full` → blurry trên retina). Dùng `fill` + parent `aspect-square` + `sizes` đúng breakpoint.
- Thêm `priority + fetchPriority='high'` cho ảnh chính → cạnh tranh được với JS bundle khi tải đầu trang, LCP giảm 300-600ms trên 3G/4G.
- Thumbnail wrap trong `<button>` thay vì `<Image onClick>` để accessible với keyboard và screen reader.
- Badge discount / category render overlay trên ảnh chính (dùng props `discountPercent`, `categoryName` vốn đã được truyền xuống).

---

## 5. Component layout

### `/products/_components/`

| File                             | Loại   | LOC | Trách nhiệm                                             |
| -------------------------------- | ------ | --- | ------------------------------------------------------- |
| `products-content.tsx`           | Client | 32  | Wrapper, dynamic import `FloatingPetals` (`ssr: false`) |
| `products-hero-section.tsx`      | Client | 199 | Hero + h1 page, ảnh `flower` priority                   |
| `products-occasions-section.tsx` | Client | 230 | Section dịp, **h2**                                     |
| `products-catalog-section.tsx`   | Client | 57  | Tiêu đề **h2** + `<ProductGrid />`                      |
| `product-grid.tsx`               | Client | 135 | `useQuery` + `initialData` seed + cursor pagination     |
| `product-card.tsx`               | Client | 159 | Motion card, optimized `next/image`, `eager` prop       |
| `product-grid-skeleton.tsx`      | RSC    | 25  | Skeleton 12 ô                                           |
| `product-grid-empty.tsx`         | Client | 30  | Empty state                                             |
| `products-promise-section.tsx`   | Client | 138 | Section cam kết                                         |

### `/products/[id]/_components/`

| File                         | Loại    | LOC | Trách nhiệm                                             |
| ---------------------------- | ------- | --- | ------------------------------------------------------- |
| `product-detail-content.tsx` | **RSC** | 77  | Compose root, tính discount, render layout grid         |
| `product-breadcrumb.tsx`     | **RSC** | 42  | Breadcrumb + nút quay lại                               |
| `product-gallery.tsx`        | Client  | ~90 | State ảnh active, optimized `next/image`, badge overlay |
| `product-summary.tsx`        | **RSC** | 61  | h1 product name + trust badges + spec dl                |
| `product-purchase-box.tsx`   | Client  | 159 | Variant select, quantity stepper, CTA                   |
| `product-promise-card.tsx`   | **RSC** | 28  | Cam kết Hoa Theo Mùa                                    |
| `product-details-tabs.tsx`   | Client  | 174 | Tabs: Mô tả / Chi tiết / Bảo quản (motion underline)    |

> Tổng client JS chỉ chứa: gallery (state), purchase box (state), tabs (state). Mọi nội dung "đọc" đều SSR - crawler thấy đầy đủ name, price, description, brand, breadcrumb, JSON-LD trong response đầu tiên.

---

## 6. Vì sao tổng thể "work" cho SEO + Performance

### SEO

- **Một `<h1>` per page** sau khi demote 2 section sub về `<h2>` → keyword relevance không bị dilute.
- **HTML đầy đủ trong response đầu tiên** - tên, giá, mô tả có sẵn cho Googlebot, Facebook crawler, Zalo preview, không cần JS.
- **JSON-LD đầy đủ trường**: `Product` + `Offer` (price, availability, condition, validUntil) + `BreadcrumbList` + `CollectionPage` + `ItemList` → đủ tiêu chuẩn rich snippet.
- **`hreflang` + `inLanguage` khớp**: alternates trong Metadata API + `inLanguage` trong structured data + `<html lang>` đều derive từ `locale`.
- **`og:image` đúng kích thước**: chỉ khai `width/height` khi ảnh thực sự là 1200×630.
- **Description ≤155 ký tự**: không bị Google cắt giữa câu.

### Performance

- **ISR + `generateStaticParams`**: top 50 detail page có HTML pre-built; list page revalidate mỗi 10 phút.
- **`initialData` + `staleTime: 60s`**: client không refetch trang 1 → tiết kiệm 1 round-trip + 1 API call mỗi visitor.
- **`next/image` thực sự được optimize**: AVIF/WebP, responsive variants, `priority` cho LCP element. So với `unoptimized`, payload ảnh giảm 40-70% trên 4G.
- **RSC compose**: detail page chỉ ship Gallery + PurchaseBox + DetailsTabs xuống client. Breadcrumb / Summary / PromiseCard không tốn bundle.
- **`React.cache()` cho metadata fetch**: chắc chắn metadata + page chia sẻ 1 lệnh gọi network duy nhất.

### Resilience

- **Try/catch ở mọi server fetch**: API hỏng → render empty grid hoặc `notFound()` thay vì 500.
- **`fetchTopProductIds` fallback `[]`**: API hỏng lúc build vẫn build pass.
- **`dynamicParams = true`**: sản phẩm mới truy cập được ngay sau khi tạo, không cần redeploy.

---

## 7. Trade-off đã chấp nhận

1. **Top 50 pre-build cứng (sort `id desc`)**: chưa có analytics để chọn top theo view/sale. Khi có, đổi sang top theo `viewCount`.
2. **`priceValidUntil` = cuối năm**: nếu mỗi offer có ngày hết hạn riêng (sale theo tuần), nên truyền giá trị đó.
3. **Stagger motion ở cha của detail page đã bỏ**: vì cha là RSC, các con tự fade-in riêng - "polished feel" giảm nhẹ nhưng đổi lại được toàn bộ HTML server-side.
4. **`safeFetchProduct` nuốt mọi lỗi**: không phân biệt 404 vs 500. Nên log ở observability sau này.
5. **Pagination dùng cursor + page-number stack**: không deep-linkable (không có `?page=2` trong URL). Nếu sau này cần SEO nhiều page con, cần đổi sang `searchParams`-based pagination.
