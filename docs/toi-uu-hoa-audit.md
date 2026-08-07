# Audit tối ưu hoá — Next.js Ecommerce

> Ngày: 2026-08-07 · Next.js 16.2.7 / React 19.2.4 · Deploy: Vercel (dự kiến chuyển VPS)
>
> Tài liệu này thay thế `products-rendering.md` và `seo-performance-roadmap.md` — xem mục
> [Tài liệu cũ](#tài-liệu-cũ-đã-lỗi-thời) ở cuối.

---

## Cách đo

Mọi con số dưới đây **đo từ bản build thật** trong `.next/`, không phải suy đoán:

- **JS mỗi route**: cộng dung lượng các chunk mà `page_client-reference-manifest.js` của route đó tham chiếu.
- **Nhận dạng chunk**: fingerprint theo từ khoá (`vietmap`, `tiptap`/`prosemirror`, `zod`, `motion`).
- **Nội dung prerender**: parse `.next/server/app/**/*.html`, **bao gồm cả container streaming
  out-of-order** (`<div hidden id="S:n">`) — nếu bỏ qua chỗ này sẽ kết luận nhầm là "thiếu nội dung".
- **Cache key**: đối chiếu bằng `hashKey()` của `@tanstack/react-query`.

Tất cả là **byte thô** (gzip ≈ 30–35%).

---

## Kết quả tổng quan

| Hạng mục                             | Trước                   | Sau                                | Thay đổi                      |
| ------------------------------------ | ----------------------- | ---------------------------------- | ----------------------------- |
| `/recruitment` JS                    | 1683 KB                 | **1110 KB**                        | −573 KB (−34%)                |
| `/recruitment/[slug]` JS             | 1481 KB                 | **903 KB**                         | −578 KB (−39%)                |
| Trang chủ — thẻ `<h1>` trong HTML    | **0**                   | **1**                              | có nội dung                   |
| Trang chủ — HTML hiển thị được       | ~0                      | 334 KB                             | toàn bộ section server-render |
| `sitemap.xml`                        | 120 URL, **0 sản phẩm** | **2.506 URL**, 2.386 sản phẩm      | +2.386                        |
| `/products` JSON-LD `ItemList`       | rỗng                    | **17 sản phẩm** (kèm giá, tồn kho) | có rich result                |
| Request auth mỗi lượt khách vãng lai | 2 (đều fail)            | **0**                              | −2                            |
| TipTap trên route `/recruitment`     | 593 KB                  | **0**                              | tải khi mở dialog             |
| `xss` trên `/news/[slug]`            | có                      | **0**                              | sanitize ở server             |

---

## Phần 1 — Các lỗi nghiêm trọng đã sửa

### 1.1. Trang chủ không render nội dung nào vào HTML 🔥

**Hiện trạng (đã đo).** File `.next/server/app/vi.html` — container streaming `S:0` (167 KB) chỉ chứa
**44 thẻ `<script>`, 2 thẻ `<a>`, 1 `<template>` và không có chữ nào hiển thị được**: 0 `<h1>`,
0 `<h2>`, 0 link sản phẩm. Khách và Googlebot nhận về: header + `HomeHero` + footer + JSON-LD +
skeleton. Toàn bộ `HomeContent` chỉ render sau khi hydrate xong.

Kể cả các server component thuần — `ShopFreshFlowersSection` (chứa `<h1>` duy nhất của trang),
`WhyChooseUsSection`, `TestimonialSection`, `CriteriaSection` — đều **không** có trong HTML.

Đối chiếu: `/products` cùng stack vẫn prerender đủ (container `S:1`, 288 KB, 1 `<h1>`, 21 `<h2>`,
17 thẻ sản phẩm). Kiểm chứng thêm: chạy `dev` thì trang chủ render đủ, chỉ **bản build** mới rỗng.

**Nguyên nhân (xác định bằng bisect).** Chèn 2 marker rồi build lại:

| Marker           | Vị trí                               | Có trong HTML? |
| ---------------- | ------------------------------------ | -------------- |
| `MARKER_OUTSIDE` | ngoài `<Suspense>`                   | ✅             |
| `MARKER_INSIDE`  | `<div>` tĩnh, **trong** `<Suspense>` | ❌             |

Một `<div>` tĩnh hoàn toàn cũng không render → **cả boundary bị loại khỏi static shell**.
Thủ phạm là `CategoryFilterSection` đọc search params (nuqs / `useSearchParams`): nó kéo
Suspense boundary gần nhất ra khỏi static shell, và vì boundary đó bọc **cả trang**, mọi anh em
tĩnh bị lôi theo.

**Cách sửa.** Bỏ `<Suspense>` bọc toàn trang ở `page.tsx` (route đã có `loading.tsx` lo streaming),
đặt boundary **đúng vào chỗ cần** — quanh `HomeCategorySections` bên trong `HomeContent`:

```tsx
// features/home/components/home-content.tsx
<Suspense fallback={<ProductGridSkeleton count={8} />}>
  <HomeCategorySections categories={categories} />
</Suspense>
```

Đồng thời `HomeCategorySections` chuyển từ client (đọc categories qua React Query) sang **server
component nhận props**, giống `ProductsCategorySections` của `/products`.

**Kết quả.** `h1: 0 → 1`, `h2: 0 → 9`, HTML hiển thị được 334 KB. LCP của trang chủ giờ là
text/ảnh server-render thay vì phải đợi hydrate.

> ⚠️ **Còn tồn đọng:** lưới sản phẩm trên trang chủ vẫn render phía client (0 link sản phẩm trong
> HTML) — đúng như thiết kế của boundary mới, nhưng `/products` chứng minh là **làm được**
> server-side. Đã thu hẹp phạm vi: trang chủ nhận đúng 1 category lúc build (probe `PROBE_CATS_1`),
> nên **không phải do thiếu dữ liệu**. Cần điều tra tiếp — xem [Việc tiếp theo](#phần-4--việc-nên-làm-tiếp).

**Bài học chung:** một client component đọc search params sẽ "đầu độc" toàn bộ Suspense boundary
chứa nó. Luôn đặt boundary **sát** component đó, đừng bọc cả trang.

---

### 1.2. `/recruitment` tải nguyên trình soạn thảo TipTap 🔥

**Hiện trạng.** `apply-job-dialog.tsx:1` import tĩnh `@/components/rich-text-editor`; `job-detail.tsx`
import dialog. Nên **trang danh sách** việc làm tải sẵn TipTap + ProseMirror (593 KB) trước khi ai đó
bấm "Ứng tuyển". Cộng với zod (328 KB) → 1683 KB, nặng gấp 2,3 lần route kế tiếp.

**Cách sửa.** Wrapper `next/dynamic` theo đúng pattern sẵn có trong repo
(`floating-contact-client.tsx`, `floating-petals-client.tsx`):

```tsx
// components/rich-text-editor-client.tsx
const RichTextEditor = dynamic(() => import('./rich-text-editor'), {
  ssr: false,
  loading: () => <Skeleton className='min-h-60 w-full rounded-md' />
})
```

Radix `Dialog` chỉ mount children khi mở → chunk chỉ tải đúng lúc cần.

**Kết quả.** `/recruitment` 1683 → **1110 KB**; `/recruitment/[slug]` 1481 → **903 KB**.
Xác nhận: **0** tham chiếu `tiptap|prosemirror` trong toàn bộ chunk của route. Kèm theo, bộ
stylesheet của editor (`styles/tiptap.scss` + các `tiptap-node/*.scss`, ~61 KB CSS) cũng rời
critical path.

---

### 1.3. Sitemap không có URL sản phẩm nào 🔥

**Hiện trạng.** `app/sitemap.ts` chỉ liệt kê trang tĩnh + bài viết + tin tuyển dụng.
**Toàn bộ `/products/[id]` bị bỏ sót** — cùng với `/occasions/[id]`, `/featured/[id]`,
`/mainline/[id]`. Đây là bề mặt crawl giá trị nhất của một site thương mại điện tử.

**Cách sửa.** Thêm hàm liệt kê có phân trang + cache riêng cho sitemap:

```ts
// features/products/queries.server.ts
export async function getAllProductIdsForSitemap(): Promise<string[]> {
  'use cache'
  cacheTag(PRODUCTS_CACHE_TAG)
  cacheLife(PRODUCT_DETAIL_LIFE)
  /* phân trang 100/lần, chặn cứng 20.000 */
}
```

Khác với `getAllProductIds` (cố tình chỉ lấy trang mới nhất cho `generateStaticParams`) — crawler
cần **toàn bộ** catalog.

**Kết quả.** 120 → **2.506 URL**: 2.386 sản phẩm, 38 tuyển dụng, 26 tin tức, 42 landing page, 14 tĩnh.

**Về sharding:** giới hạn là 50.000 URL / 50 MB. Ở mức 2.506 URL, một file là đủ và
`generateSitemaps()` chỉ làm phức tạp thêm mà không được gì. Ngưỡng nên tách: **~20.000 URL**
(đã ghi chú trong code).

---

### 1.4. JSON-LD `ItemList` của `/products` rỗng

**Hiện trạng.** `products/page.tsx` gọi `buildProductsCollectionJsonLd(locale, [])`. Hàm này gate
`ItemList` bằng `items.length > 0`, nên khối structured data mà `products-rendering.md` mô tả đã
**âm thầm biến mất** — mất khả năng hiện product carousel trên SERP.

**Vì sao lọt lưới:** signature nhận `Product[]`, nhưng dữ liệu prefetch là `ProductDetail[]` —
mà `ProductDetail extends Omit<Product, ProductRawFieldKey>` nên **không có** `priceRaw` /
`availableForSaleRaw`. Truyền `[]` là cách nhanh nhất để qua được typecheck.

**Cách sửa.** Đổi signature sang `ProductDetail[]` và đọc field đã parse (`product.price`,
`product.availableForSale`) — vừa đúng hơn vừa khớp với `buildProductDetailJsonLd`. Trang gom
sản phẩm từ chính vòng prefetch (giữ thứ tự bằng mảng theo index, không push từ callback song song),
dedupe theo id, giới hạn 30.

**Kết quả.** `ItemList` có **17 sản phẩm**, đủ `name` / `price` / `availability`.

---

### 1.5. Mỗi khách vãng lai tốn 2 request auth chắc chắn fail

**Hiện trạng.** `useGetMe()` chạy trên mọi trang (qua `NavBar`, `RoleGuard`, `AuthGuard`).
React Query dedupe còn 1 request → trả `401 MissingAccessToken` → `lib/axios.ts` liệt
`MissingAccessToken` trong `expiredAccessTokenCodes` → kích hoạt refresh **không bao giờ thành công**.

Cả 2 request đều đi qua `app/api/[...path]/route.ts` nên mỗi cái là một serverless invocation.
Header hiển thị `<Skeleton>` cho đến khi cả 2 fail → nav "nhảy" trên mọi lượt tải trang.

**Điểm cần lưu ý — không xoá `MissingAccessToken` khỏi danh sách.** Comment trong code từng nói
ngược lại, nhưng nó **có tác dụng thật**: access token cookie ngắn hạn, người dùng quay lại thường
chỉ còn refresh token và API báo "missing" chứ không phải "expired". Xoá đi là **đăng xuất** những
phiên đó. Comment đã được sửa lại cho đúng.

**Cách sửa — chặn từ đầu nguồn.** Middleware là nơi duy nhất thấy cookie HttpOnly thật trên mọi
điều hướng, nên nó đồng bộ một cookie đọc được cho client:

```ts
// proxy.ts — chỉ ghi khi lệch, để không đính Set-Cookie vào mọi response ISR
const syncSessionHint = (response, request, isProbablyAuthed) => {
  const hasHint = request.cookies.get('hasSession')?.value === '1'
  if (isProbablyAuthed === hasHint) return response
  ...
}
```

```ts
// features/users/hooks/use-get-me.ts
enabled: hasSessionHint
```

Ba chi tiết quan trọng:

1. **Tự lành**: phiên đăng nhập có từ trước khi deploy sẽ được cấp cookie ở lần điều hướng kế tiếp.
2. **`isLoading` thay cho `isPending`**: query bị disable sẽ ở trạng thái `pending` **vĩnh viễn** —
   dùng `isPending` sẽ ghim header ở skeleton mãi mãi với khách vãng lai.
3. **Không phải lớp bảo mật** — chỉ quyết định "có hỏi hay không". Phân quyền vẫn ở API.

**Kết quả (đã kiểm chứng bằng curl).** Khách vãng lai: response `/` **không** có `Set-Cookie: hasSession`
(giữ nguyên `x-nextjs-prerender: 1`, không phá cache); HTML header render sẵn nút đăng nhập,
**không còn skeleton**. Route bảo vệ vẫn 307, `/products/[id]` vẫn 200.

Phụ thu: `guardPurchase()` trước đây `return false` im lặng khi `isGettingMe` — khách bấm "thêm vào
giỏ" bị **nuốt click**. Giờ chuyển thẳng sang `/sign-in`.

---

### 1.6. `/b2b` rebuild 120 lần/giờ cho dữ liệu không đổi

`revalidate = 30` trong khi dữ liệu đến từ config group cache 3600s và **đã** được webhook purge
(`b2bServices → ['/b2b']`). Đổi thành `3600`. Đồng thời `/b2b` import thẳng `FloatingPetals` thay vì
wrapper `FloatingPetalsClient` như mọi nơi khác → đã sửa.

### 1.7. `/products/[id]` và `/news/[slug]` static vĩnh viễn

Cả hai không export `revalidate`. `unstable_cache` (3600s) chỉ làm mới **dữ liệu**; HTML chỉ được
dựng lại bởi `revalidatePath` từ webhook. Webhook trượt một lần → trang stale mãi mãi. Đáng lo nhất
là `/news/[slug]`: webhook cố tình cho `slug` optional vì admin hay gửi id số — trường hợp đó chỉ tag
được purge, HTML thì không.

Thêm `revalidate = 3600` làm lưới an toàn. Đã xác nhận trong bảng build: cả hai giờ là `1h`.

### 1.8. `SanitizedHtml` là client component

Trên `/news/[slug]`, thư viện `xss` được gửi xuống browser và một `useEffect` duyệt
`querySelectorAll('*')` để gỡ attribute **sau khi mount** — toàn bộ chi phí main-thread cho markup mà
server đã có sẵn.

Đã dồn cả 3 việc của `useEffect` (gỡ attribute trình bày, thêm `rel` cho `target="_blank"`, cắt block
rỗng cuối bài) vào pipeline chuỗi trong `lib/sanitize.ts` — vốn đã cố tình **không phụ thuộc DOM**.
Tách thành:

- `components/sanitized-html.tsx` — **server component**, sanitize rồi render.
- `components/rich-text-body.tsx` — client island duy nhất, chỉ lo điều hướng link nội bộ.

`job-detail.tsx` là client component (job đến từ client query) nên tự gọi `sanitizeRichText` và dùng
`RichTextBody` trực tiếp.

> ⚠️ Giữ `lib/sanitize.ts` **không phụ thuộc DOM**. Đây chính là bản vá sau sự cố
> `isomorphic-dompurify` kéo theo jsdom làm sập mọi render chưa cache của `/news/[slug]`.

**Kết quả.** 0 tham chiếu `FilterXSS` trong chunk của `/news/[slug]`.

### 1.9. `revalidate` khai báo sai sự thật ở trang chủ

Trang chủ khai `revalidate = 86400` nhưng `curl -I /` trả `x-nextjs-stale-time: 300`.
Nguyên nhân: `getCachedProducts` bọc `unstable_cache({ revalidate: 300 })`, và **cache ngắn nhất mà
lần render chạm vào sẽ thắng**. Đã sửa hằng số về `300` cho khớp thực tế (không đổi hành vi) kèm
comment giải thích — 5 phút vốn cũng là mức đúng cho giá sản phẩm.

---

## Phần 2 — Những chỗ đã làm tốt (đừng sửa)

Nêu rõ để không ai "cải tiến" nhầm:

- **Kiến trúc cache.** Tag purge + `app/api/revalidate` là đúng. `expandPaths` xử lý prefix locale
  `as-needed` là một bug tinh vi đã được bắt. (Tầng cache bên dưới đã chuyển sang `'use cache'` —
  xem [Phần 6](#phần-6--chuyển-sang-use-cache).)
- **Cache key của prefetch section.** Đã kiểm bằng `hashKey()`: `ProductGrid` chuẩn hoá `'' → undefined`
  (`product-grid.tsx:91`) nên key client khớp **chính xác** `getSectionDefaultParams` phía server.
  Rất dễ vỡ, và đã được làm cẩn thận — lệch một chút là toàn bộ prefetch mất tác dụng trong im lặng.
- **Cấu hình ảnh.** AVIF/WebP, `deviceSizes`/`imageSizes`/`qualities` chọn tay, `minimumCacheTTL` 30 ngày.
- **Hoãn nhạc nền.** Trễ 4s + `requestIdleCallback` rồi mới mount `<audio>` — file MP3 6,4 MB không
  bao giờ chạm critical path.
- **`LazyMapEmbed`.** IntersectionObserver + nút bấm dự phòng; chunk VietMap 760 KB **không** nằm
  trong initial load của `/contact` (đã xác nhận).
- **`ScopedIntlProvider`.** Tách namespace nặng khỏi bundle client gốc rồi nạp lại theo route, kèm
  ghi chú provider lồng nhau của next-intl v4 **thay thế** chứ không merge.
- **`generateStaticParams` + `dynamicParams = true`** ở mọi route động, kèm `catch → []` để API chết
  không làm hỏng build.
- **`content-visibility: auto`** cho các section dưới màn hình đầu của trang chủ.
- **Font.** `next/font`, subset `vietnamese`, `display: 'swap'`, fallback stack đầy đủ.

---

## Phần 3 — Cố tình KHÔNG đề xuất

| Hạng mục                     | Lý do                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Redis / cache handler riêng  | Xem [Phần 6](#phần-6--chuyển-sang-use-cache) — giờ đã thành điều kiện tiên quyết thật sự, không còn là "chưa cần". |
| Virtualize danh sách         | Lưới chỉ 8–20 item.                                                                                                |
| Thay axios bằng `fetch`      | Tầng interceptor (điều phối refresh, header locale/timezone) đang gánh việc thật.                                  |
| Bỏ nuqs / React Query        | Cả hai đều xứng đáng với dung lượng của nó ở đây.                                                                  |
| Thêm `useMemo`/`useCallback` | Đã có 216 chỗ. Lợi ích nằm ở **bớt client component**, không phải memo thêm.                                       |
| Edge runtime                 | API proxy là I/O-bound tới một upstream duy nhất.                                                                  |

---

## Phần 4 — Việc nên làm tiếp

Xếp theo tỉ lệ lợi ích / công sức.

### 4.1. `motion/react` nằm trên critical path của mọi trang marketing — Cao

50 file import `motion/react`. Chunk 124 KB được nạp cả trên `/privacy` và `/terms` — hai trang chữ
tĩnh — vì `policy-page-shell.tsx` và `policy-section.tsx` là client component dùng motion.

Đại đa số chỉ dùng **một** pattern không tương tác: fade + trượt lên khi cuộn tới. Việc đó là
`@keyframes` + `animation-timeline: view()` (hoặc ~15 dòng IntersectionObserver + class CSS), không
cần vòng lặp animation JS hay spring physics trên main thread.

Đề xuất: một component `<Reveal>` bằng CSS dùng được ở server; chỉ giữ `motion` ở chỗ có gesture/layout
thật. Bắt đầu từ `policies/`, `about/`, `b2b/` (~35/50 file).
→ −124 KB thô trên hầu hết route công khai; cải thiện lớn TBT/INP trên Android đời thấp.

### 4.2. `ProductCard` là client component có motion, nhân N thẻ mỗi lưới — Cao

`'use client'` + `motion.article` + spring `whileHover` + `Variants` riêng từng thẻ + `TooltipProvider`.
Một trang category render vài lưới × 8–20 thẻ, mỗi thẻ là một client component có animation độc lập —
đây là chi phí hydration và giật cuộn lớn nhất trên đúng những trang quan trọng nhất về doanh thu.

Hover lift và stagger đều làm được bằng CSS (`transition`, `animation-delay`). Thẻ chỉ thực sự cần JS
cho tooltip → tách thành leaf island.

### 4.3. Lưới sản phẩm trang chủ vẫn client-render — Cao

Xem [1.1](#11-trang-chủ-không-render-nội-dung-nào-vào-html-). Đã loại trừ được nguyên nhân dữ liệu
(trang chủ nhận đúng 1 category lúc build). `/products` render được cùng component
`CategoryFilterSection` ở phía server, nên khác biệt nằm ở cấu trúc boundary — cần bisect tiếp.

### 4.4. 57 MB ảnh nguồn, nhiều file PNG 2–3 MB — Trung bình

`public/images/about/*.png` mỗi file 2,0–2,8 MB; `value.png` 2,3 MB; `ContactFlower.png` 1,7 MB.
`next/image` xử lý được **byte gửi đi**, nhưng không xử lý: độ trễ tối ưu hoá lần đầu (server phải
decode PNG 2,8 MB), dung lượng repo/deploy, và **chi phí CPU khi tự host** — lúc đó bạn sở hữu luôn
cái optimizer. Re-encode sang WebP/JPEG, mục tiêu < 300 KB/file. Thuần thao tác, không đụng code.

### 4.5. 260 KB CSS chặn render trên mọi route — Trung bình

Một file CSS cho mọi trang (326 KB ở recruitment trước khi tách TipTap). Khá lớn với Tailwind v4;
nghi can là `shadcn/tailwind.css` + `tw-animate-css`. Nén tốt nên ưu tiên thấp hơn JS, nhưng nó nằm
trên critical rendering path của **mọi** trang.

### 4.6. Kiểm tra `/occasions/[id]` và `/featured/[id]` — Trung bình

HTML prerender của các trang này có 0 link sản phẩm, trong khi `/mainline/[id]` có 4 — dù **dùng
chung code path**. Nhiều khả năng do dữ liệu (không có sản phẩm trong category đó lúc build) chứ
không phải bug, nhưng nên xác nhận.

### 4.7. `zod` 328 KB trên các route có form — Thấp

Chỉ nạp ở `/contact` và `/recruitment`. Cân nhắc `zod/mini` nếu cần.

---

## Phần 5 — Điểm số

| Hạng mục              | Trước | Sau    | Ghi chú                                                |
| --------------------- | ----- | ------ | ------------------------------------------------------ |
| Rendering Strategy    | C+    | **B+** | Trang chủ đã có nội dung; lưới sản phẩm còn tồn đọng   |
| Caching Strategy      | A−    | **A**  | Đã có lưới an toàn ISR; `revalidate` khai đúng sự thật |
| JavaScript Bundle     | D+    | **C+** | −578 KB route nặng nhất; motion vẫn còn                |
| Client/Server Balance | C     | **C+** | 190/525 file `'use client'`                            |
| Hydration             | C−    | **C**  | Bỏ được DOM walk; ProductCard vẫn nặng                 |
| SEO                   | C     | **A−** | Sitemap + ItemList + `<h1>` trang chủ                  |
| Core Web Vitals       | C     | **B**  | LCP trang chủ hết phụ thuộc hydrate                    |
| Data Fetching         | B     | **A−** | Bỏ 2 request/lượt xem                                  |
| Database Efficiency   | —     | —      | Không truy cập DB trực tiếp, chỉ gọi API               |
| Code Splitting        | C−    | **B**  | TipTap tải theo nhu cầu                                |
| Maintainability       | B+    | **A−** | Ranh giới feature rõ, comment chất lượng cao           |
| Scalability           | B−    | **B+** | Sitemap có phân trang + chặn cứng                      |

---

## Kiểm chứng lại

```bash
pnpm build && pnpm check

# 1. Trang chủ có nội dung (test regression chính)
grep -c '<h1' .next/server/app/vi.html            # kỳ vọng >= 1

# 2. TipTap không còn trên route recruitment  → xem lệnh node trong plan
# 3. Sitemap có sản phẩm
curl -s localhost:3000/sitemap.xml | grep -c '/products/'   # kỳ vọng > 0

# 4. Khách vãng lai không gọi auth: mở / ở cửa sổ ẩn danh, lọc Network theo /api
#    → không có users/me, không có refresh_token. Sau đó đăng nhập và kiểm tra lại nav/giỏ/đơn.

# 5. Route công khai không bị 307 (bẫy PUBLIC_ROUTE_PATHS)
curl -sI localhost:3000/products/<id>             # kỳ vọng 200
```

**Đo Lighthouse ở trạng thái warm** (lần tải thứ hai) — lần tải nguội đo tốc độ tối ưu hoá ảnh chưa
cache, không phải tốc độ ứng dụng.

---

## Tài liệu cũ (đã lỗi thời)

`docs/products-rendering.md` và `docs/seo-performance-roadmap.md` mô tả một thiết kế **đã bị thay thế**:
chúng nhắc tới branch `feat/21-products-page`, thư mục `_components/`, cursor pagination và
`React.cache()` bọc `fetch` — đều không còn trong code. Giữ lại làm tư liệu lịch sử; khi cần đối chiếu
hành vi hiện tại, dùng tài liệu này.

---

## Phần 6 — Chuyển sang `use cache`

> Cập nhật 2026-08-07. Toàn bộ `unstable_cache` đã được thay bằng directive `'use cache'` theo yêu cầu.

### Đã làm gì

9 file `features/*/queries.server.ts` chuyển từ `unstable_cache(fn, keyParts, { tags, revalidate })`
sang `'use cache'` + `cacheTag()` + `cacheLife()`. Lifetime tập trung ở **`lib/cache-life.ts`**
(4 profile: `PRODUCTS_LIST_LIFE`, `PRODUCT_DETAIL_LIFE`, `CONTENT_LIFE`, `RECRUITMENT_LIST_LIFE`).

Lợi ích thấy được ngay: **không còn key thủ công**. `unstable_cache` cần
`['products-list', JSON.stringify(params)]` — lệch một chữ là cache im lặng phân mảnh.
`'use cache'` tự sinh key từ chính tham số của hàm.

`React.cache()` vẫn được giữ **bên ngoài** các scope `'use cache'` cho `getProductDetail`,
`getArticle`, `getCachedJobDescription`, `getPublicConfigsGroup` — để `generateMetadata` và thân
trang dùng chung một lần đọc. Bắt buộc phải ở ngoài: `React.cache` bị cô lập bên trong ranh giới
`use cache`.

### Hai ràng buộc đã giữ nguyên (đều rút ra từ lịch sử revert)

**1. KHÔNG bật `cacheComponents`.** Directive `'use cache'` đã chạy được nhờ
`experimental.useCache: true` (bản build in `✓ useCache`). Bật `cacheComponents: true` làm build
**fail với 24 lỗi trên 19 file route** — đã thử và xác nhận:

| Route segment config xung đột | Số lỗi |
| ----------------------------- | ------ |
| `revalidate`                  | 18     |
| `dynamicParams`               | 6      |

> `Route segment config "revalidate" is not compatible with nextConfig.cacheComponents. Please remove it.`

Tức là toàn bộ chiến lược ISR + `generateStaticParams` của storefront. Đây là rào chắn thật sự,
không phải vấn đề React Query như từng ghi nhận trước đó.

**2. `cacheLife.stale` giữ ngắn (60s–5m).** `stale` là **cache của client router**, không phải
server. Đặt dài (vd `stale: 3600`) khiến trình duyệt tiếp tục phục vụ bản cũ sau `revalidateTag` —
purge chạy đúng trên server nhưng **trông như hỏng** với người đang test. Đây chính là nguyên nhân
lần revert 2026-08-05.

### Đánh đổi phải chấp nhận

Lý do của 3 lần revert trước vẫn còn nguyên và **không** được giải quyết bởi lần chuyển này:

- `'use cache'` với handler mặc định = `DefaultCacheHandler`, **in-memory theo từng process**.
  Trên Vercel, `revalidateTag` trong webhook chỉ purge đúng instance nhận request đó; các instance
  còn lại giữ bản riêng đến khi `cacheLife.revalidate` hết hạn.
- Cache **không sống qua deploy** — key có chứa build id. Mỗi lần deploy là toàn bộ catalog phải
  đọc lại từ POS API.
- Trên serverless, entry có thể **không dùng lại được giữa các request** (mỗi request một instance).

**Vì sao vẫn chấp nhận được:** `revalidatePath` mới là nửa gánh việc chính của webhook. Nó đi qua
route cache dùng chung, nên HTML dựng lại vẫn đúng ngay cả khi một instance khác còn giữ data entry
cũ. Đã kiểm chứng: `HIT → MISS (dựng lại) → HIT`, webhook trả
`{"revalidated":true,"paths":[...6 paths],"tags":["products"]}`.

> ⚠️ **Kiểm chứng trên chỉ chạy 1 process local.** Hành vi nhiều instance trên Vercel — đúng thứ gây
> ra 3 lần revert — **không tái hiện được ở local**. Cần theo dõi thực tế sau khi deploy: sửa giá
> trong admin rồi reload nhiều lần ở cửa sổ ẩn danh, xem có lần nào ra giá cũ không.

### Cách gỡ triệt để

Cần một **shared cache handler**, chọn một trong hai:

1. **`'use cache: remote'`** — handler do platform cung cấp. Cần `cacheComponents: true`, tức phải
   xử lý xong 24 lỗi route config ở trên; thêm chi phí network roundtrip + phí platform.
2. **`cacheHandlers.default`** tự cấu hình, trỏ tới một store dùng chung (Redis/KV).

Khi tự host trên VPS: một process Node sống lâu thì in-memory cache hoạt động tốt và `revalidateTag`
với tới đúng process đó. Nhưng **từ 2 instance sau load balancer trở lên thì vấn đề quay lại y
nguyên** — nên đây là điều kiện tiên quyết của việc migrate, không phải thứ VPS tự giải quyết.

### Xác nhận sau khi chuyển

- `pnpm build` exit 0, **204 route prerender** (không đổi).
- Trang chủ `h1=1 h2=9`; `/products` `h1=1 h2=24`, **17 link sản phẩm** (không đổi).
- Cửa sổ ISR giữ nguyên: `/[locale]` `5m`, `/about` `1h`, `/products/[id]` `1h`.
- `pnpm check` sạch (0 error).
