# Hướng dẫn gọi Webhook Revalidate (dành cho Backend)

> Tài liệu này mô tả **hợp đồng (contract)** mà backend phải gửi tới storefront
> Next.js mỗi khi có thay đổi dữ liệu, để trang public cập nhật nội dung **ngay lập tức**
> thay vì phải chờ hết thời gian cache.
>
> - **Endpoint storefront:** `POST https://hoatheomua.net/api/revalidate`
> - **File xử lý:** `app/api/revalidate/route.ts`
> - Cập nhật lần cuối: 2026-08-05

---

## 1. Vì sao cần webhook này?

Storefront (trang bán hàng công khai) **không gọi API backend mỗi lần có người truy cập**.
Để nhanh, nó lưu cache dữ liệu ở **2 tầng**:

| Tầng cache                    | Là gì                                                                                                                            | Xoá bằng cách nào      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Tag cache** (`'use cache'`) | Cache kết quả đọc từ API backend (ví dụ danh sách sản phẩm), gắn nhãn theo _tag_ như `products`, `articles`, `configs:products`… | `revalidateTag(tag)`   |
| **ISR cache** (HTML trang)    | Cache sẵn HTML của từng trang (ví dụ `/products`, `/news/abc`)                                                                   | `revalidatePath(path)` |

Khi admin sửa dữ liệu, **cả hai tầng đều đang giữ bản cũ**. Nếu không báo cho storefront,
người dùng sẽ thấy nội dung cũ cho tới khi cache tự hết hạn (từ 30 giây tới 24 giờ, tuỳ trang).

👉 **Việc của backend:** sau mỗi thao tác tạo/sửa/xoá thành công, gọi `POST /api/revalidate`
với đúng `entity`. Storefront sẽ tự xoá đúng tag + rebuild đúng trang cho **cả 2 ngôn ngữ (vi + en)**.

---

## 2. Xác thực (Authentication)

Mọi request **bắt buộc** kèm header bí mật:

```
x-revalidate-secret: <REVALIDATE_SECRET>
content-type: application/json
```

- Giá trị `REVALIDATE_SECRET` do bên vận hành cung cấp (biến môi trường trên storefront).
- Sai secret → `401 unauthorized`. Storefront chưa cấu hình secret → `503 server-not-configured`.

---

## 3. Cấu trúc Body

Body luôn là JSON, phân biệt theo trường `entity`. Danh sách đầy đủ:

| `entity`         | Trường bắt buộc  | Trường tuỳ chọn | Ý nghĩa                                                                 |
| ---------------- | ---------------- | --------------- | ----------------------------------------------------------------------- |
| `product`        | `id` (string)    | —               | Một sản phẩm thay đổi (giá, tồn kho, ghim, sắp xếp, đồng bộ POS)        |
| `productList`    | —                | —               | Thay đổi diện rộng nhiều sản phẩm (đồng bộ hàng loạt, sửa giá loạt)     |
| `category`       | —                | —               | Danh mục sản phẩm đổi (thêm/sửa/xoá/sắp xếp, gán sản phẩm vào danh mục) |
| `news`           | `slug` (string)  | —               | Một bài viết tin tức thay đổi                                           |
| `newsList`       | —                | —               | Thay đổi diện rộng tin tức (bài mới/xoá, sửa danh mục tin)              |
| `config`         | `group` (string) | `key` (string)  | Một cấu hình nội dung (home) thay đổi                                   |
| `recruitment`    | —                | `slug` (string) | Một tin tuyển dụng thay đổi                                             |
| `companyAddress` | —                | —               | Địa chỉ công ty thay đổi                                                |
| `home`           | —                | —               | "Nút bấm" làm mới thủ công trang chủ                                    |

> ⚠️ Gửi sai cấu trúc (thiếu trường bắt buộc, sai tên `entity`) → `400 invalid-body`,
> kèm chi tiết lỗi trong `issues`.

---

## 4. Bảng ánh xạ: Thao tác Admin → Webhook cần gửi ⭐

Đây là bảng quan trọng nhất. Cột "Endpoint admin" là API hiện có trong app quản trị
(`taskcoper-fe`, prefix `…/ecommerce-api`). Sau khi thao tác **thành công**, gửi webhook tương ứng.

### 4.1. Sản phẩm

| Endpoint admin                          | Webhook gửi đi                                 |
| --------------------------------------- | ---------------------------------------------- |
| `PUT /v1/products/:id/move` (sắp xếp)   | `{ "entity": "product", "id": "<id>" }`        |
| `PUT /v1/products/pin` (ghim/bỏ ghim)   | `{ "entity": "product", "id": "<productId>" }` |
| Đồng bộ hàng loạt từ Nhanh.vn           | `{ "entity": "productList" }`                  |
| Sửa giá/tồn kho nhiều sản phẩm cùng lúc | `{ "entity": "productList" }`                  |

> Nếu một thao tác đụng tới nhiều sản phẩm mà bạn không muốn gửi nhiều webhook, cứ gửi
> một `productList` là đủ.

### 4.2. Tin tức (News / Article)

| Endpoint admin                          | Webhook gửi đi                           |
| --------------------------------------- | ---------------------------------------- |
| `POST /v1/news` (tạo, có slug)          | `{ "entity": "news", "slug": "<slug>" }` |
| `PUT /v1/news/:id` (sửa)                | `{ "entity": "news", "slug": "<slug>" }` |
| `DELETE /v1/news/:id` (xoá)             | `{ "entity": "news", "slug": "<slug>" }` |
| Tạo bài chưa có slug (bản nháp)         | `{ "entity": "newsList" }`               |
| `POST/PUT/DELETE /v1/category-news/:id` | `{ "entity": "newsList" }`               |

> ⚠️ **CỰC KỲ QUAN TRỌNG — dùng `slug`, KHÔNG dùng `id`.**
> App admin thao tác bài viết theo `id` (số), nhưng storefront tạo URL theo `slug`
> (`/news/<slug>`). Backend **phải đọc trường `slug`** của bài viết rồi bỏ vào webhook.
> Nếu bài viết có `slug = null` (nháp, chưa publish) thì gửi `newsList`.

### 4.3. Danh mục sản phẩm (bao gồm danh mục "campaign"/dịp lễ)

| Endpoint admin                                                   | Webhook gửi đi             |
| ---------------------------------------------------------------- | -------------------------- |
| `POST /v1/category-products` (tạo)                               | `{ "entity": "category" }` |
| `PUT /v1/category-products/:id` (sửa / sắp xếp)                  | `{ "entity": "category" }` |
| `DELETE /v1/category-products/:id` (xoá)                         | `{ "entity": "category" }` |
| `PUT /v1/category-products/:id/products` (gán sản phẩm)          | `{ "entity": "category" }` |
| `PUT /v1/category-products/detail` (đổi danh mục của 1 sản phẩm) | `{ "entity": "category" }` |

### 4.4. Cấu hình nội dung trang (Config)

Mọi nội dung "mềm" của trang (banner, bộ sưu tập sản phẩm, dịp lễ, feedback, thông tin
công ty, thông tin liên hệ, dịch vụ B2B…) đều được lưu dưới dạng **Config** với một `group`.

| Endpoint admin                 | Webhook gửi đi                                               |
| ------------------------------ | ------------------------------------------------------------ |
| `POST /v1/configs` (tạo)       | `{ "entity": "config", "group": "<group>", "key": "<key>" }` |
| `PUT /v1/configs/:id` (sửa)    | `{ "entity": "config", "group": "<group>", "key": "<key>" }` |
| `DELETE /v1/configs/:id` (xoá) | `{ "entity": "config", "group": "<group>", "key": "<key>" }` |

**Giá trị `group` phải khớp CHÍNH XÁC** với trường `group` của config record (chính là
`groupName` mà admin dùng khi gọi API config). `key` là tuỳ chọn (chỉ để log, không bắt buộc).

Các `group` mà storefront quan tâm và trang bị ảnh hưởng:

| `group`       | `key` thường gặp                                                                     | Ảnh hưởng tới trang                                       |
| ------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `products`    | `products.occasions`, `products.featured`, `products.mainline`, `products.signature` | Trang chủ, `/products`, các trang dịp lễ/nổi bật/mainline |
| `banners`     | `banners.collection`                                                                 | Trang chủ                                                 |
| `feedbacks`   | `feedbacks.collection`                                                               | Trang chủ (mục cảm nhận khách hàng)                       |
| `company`     | `company.bg_video`, `company.bg_music`, `company.gpkd`, `company.hotlines`           | Trang chủ, `/contact`                                     |
| `contact`     | `contact.phone`, `contact.email`                                                     | `/contact`, `/b2b`                                        |
| `b2bServices` | (dịch vụ B2B)                                                                        | `/b2b`, `/b2b/<service>`                                  |

> `group` khác (ví dụ `ahamove`) vẫn gửi được — storefront chỉ xoá tag dữ liệu, không rebuild
> trang nào (vì các trang đó không cache HTML). An toàn, không lỗi.

### 4.5. Tuyển dụng (Recruitment)

| Endpoint admin                          | Webhook gửi đi                                  |
| --------------------------------------- | ----------------------------------------------- |
| `POST /v1/job-descriptions` (tạo)       | `{ "entity": "recruitment", "slug": "<slug>" }` |
| `PUT /v1/job-descriptions/:id` (sửa)    | `{ "entity": "recruitment", "slug": "<slug>" }` |
| `DELETE /v1/job-descriptions/:id` (xoá) | `{ "entity": "recruitment", "slug": "<slug>" }` |
| Không rõ slug / thay đổi danh sách      | `{ "entity": "recruitment" }`                   |

> `slug` là tuỳ chọn: có `slug` → làm mới cả trang chi tiết `/recruitment/<slug>` lẫn danh sách;
> không có → chỉ làm mới danh sách `/recruitment`.

### 4.6. Địa chỉ công ty

| Endpoint admin                  | Webhook gửi đi                   |
| ------------------------------- | -------------------------------- |
| `POST /v1/company-addresses`    | `{ "entity": "companyAddress" }` |
| `PUT /v1/company-addresses/:id` | `{ "entity": "companyAddress" }` |

---

## 5. Chi tiết mỗi entity xoá cache gì

Để tham khảo/kiểm chứng. `paths` được nhân đôi cho `vi` (không tiền tố) và `en` (tiền tố `/en`).

| `entity`              | Tag bị xoá                                   | Trang (path) được rebuild                            |
| --------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `product` (id)        | `products`                                   | `/products/<id>`, `/products`, `/`                   |
| `productList`         | `products`                                   | `/products`, `/`                                     |
| `category`            | `categories`, `products`                     | `/products`, `/`                                     |
| `news` (slug)         | `articles`                                   | `/news/<slug>`, `/news`                              |
| `newsList`            | `articles`                                   | `/news`                                              |
| `config` (group)      | `configs:<group>`                            | tuỳ `group` (xem bảng 4.4)                           |
| `recruitment` (slug?) | `recruitment`                                | `/recruitment` (+ `/recruitment/<slug>` nếu có slug) |
| `companyAddress`      | `company-address`                            | `/contact`                                           |
| `home`                | `products`, `categories`, `configs:products` | `/`                                                  |

---

## 6. Ví dụ gọi

### 6.1. cURL

```bash
# Sản phẩm id 12345 vừa đổi giá
curl -X POST https://hoatheomua.net/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"entity":"product","id":"12345"}'

# Bài viết vừa sửa (dùng slug!)
curl -X POST https://hoatheomua.net/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"entity":"news","slug":"cach-cham-soc-hoa-tuoi"}'

# Sửa bộ sưu tập dịp lễ (config group products)
curl -X POST https://hoatheomua.net/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"entity":"config","group":"products","key":"products.occasions"}'
```

### 6.2. Node.js (axios) — gợi ý một hàm dùng chung

```ts
import axios from 'axios'

const STOREFRONT_URL = process.env.STOREFRONT_URL! // https://hoatheomua.net
const SECRET = process.env.REVALIDATE_SECRET!

// Gọi "bắn rồi quên" — KHÔNG để lỗi revalidate làm hỏng luồng nghiệp vụ chính.
export async function revalidateStorefront(body: Record<string, unknown>) {
  try {
    await axios.post(`${STOREFRONT_URL}/api/revalidate`, body, {
      headers: { 'x-revalidate-secret': SECRET },
      timeout: 5000
    })
  } catch (err) {
    // Chỉ log, không throw. Cache sẽ tự hết hạn theo thời gian như phương án dự phòng.
    console.error('[revalidate] failed:', body, err?.message)
  }
}

// Ví dụ dùng sau khi cập nhật bài viết thành công:
await updateNews(id, payload)
await revalidateStorefront({ entity: 'news', slug: news.slug })
```

### 6.3. Response trả về

```jsonc
// 200 OK
{
  "revalidated": true,
  "paths": ["/products/12345", "/products", "/", "/en/products/12345", "/en/products", "/en"],
  "tags": ["products"]
}
```

| HTTP | `reason`                | Nghĩa                           |
| ---- | ----------------------- | ------------------------------- |
| 200  | —                       | Thành công                      |
| 400  | `invalid-json`          | Body không phải JSON hợp lệ     |
| 400  | `invalid-body`          | Thiếu/sai trường (xem `issues`) |
| 401  | `unauthorized`          | Sai `x-revalidate-secret`       |
| 503  | `server-not-configured` | Storefront chưa cấu hình secret |

---

## 7. Lưu ý quan trọng

1. **Tin tức dùng `slug`, không dùng `id`.** Đây là lỗi dễ mắc nhất. URL public là
   `/news/<slug>`; gửi `id` sẽ revalidate nhầm đường dẫn không tồn tại. Xem mục 4.2.

2. **`config.group` phải khớp chính xác chuỗi.** Storefront tạo tag theo công thức
   `configs:<group>`. Gửi đúng chuỗi `group` đang lưu trong DB (ví dụ `b2bServices`,
   không phải `b2b_services`).

3. **Gửi "bắn rồi quên".** Việc revalidate KHÔNG được làm hỏng thao tác nghiệp vụ chính.
   Nếu webhook lỗi (mạng, timeout), chỉ cần log lại; cache vẫn tự hết hạn theo thời gian.

4. **Chỉ gửi sau khi thao tác THÀNH CÔNG.** Đừng gửi trong transaction chưa commit —
   storefront có thể đọc lại đúng bản dữ liệu cũ.

5. **Trang chi tiết dịp lễ/nổi bật/mainline (`/occasions/<id>`, `/featured/<id>`,
   `/mainline/<id>`) làm mới trong tối đa ~5 phút.** Webhook `product`/`category`/`config`
   xoá đúng _dữ liệu_ của các trang này ngay, nhưng phần HTML của từng trang chi tiết tự
   rebuild theo ISR (~5 phút) vì backend không gửi kèm danh sách id cụ thể. Trang chủ và
   `/products` — nơi hiển thị chính các thẻ này — được làm mới ngay.

6. **Có thể gộp/gửi nhiều webhook.** Nếu một thao tác ảnh hưởng nhiều loại (ví dụ vừa đổi
   danh mục vừa gán sản phẩm), cứ gửi từng webhook tương ứng; chúng độc lập và cộng dồn.

---

## 8. Checklist tích hợp phía backend

- [ ] Thêm biến môi trường `STOREFRONT_URL` và `REVALIDATE_SECRET`.
- [ ] Viết một hàm dùng chung `revalidateStorefront(body)` kiểu "bắn rồi quên" (mục 6.2).
- [ ] Gắn lời gọi vào **sau khi commit thành công** ở các controller:
  - Products (move, pin), đồng bộ Nhanh.vn → `product` / `productList`
  - News (create/update/delete) → `news` (kèm `slug`) / `newsList`
  - Category-news (create/update/delete) → `newsList`
  - Category-products (mọi mutation) → `category`
  - Configs (create/update/delete) → `config` (kèm `group`)
  - Job-descriptions (create/update/delete) → `recruitment` (kèm `slug`)
  - Company-addresses (create/update) → `companyAddress`
- [ ] Với news: đảm bảo đọc được `slug` của bài viết trước khi gửi (kể cả khi xoá).
- [ ] Test bằng cURL (mục 6.1) và kiểm tra response `revalidated: true`.

```

```
