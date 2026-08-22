# API-001 - Sản phẩm fixture còn bán được và tìm thấy trên trang sản phẩm

> **Layer:** API · **Status:** Implemented · **Spec:** `e2e/create-order/api-001-fixture-product-canary.spec.ts`

Canary cho dữ liệu fixture dùng chung. Nếu sản phẩm fixture bị ngừng bán, đổi tên hoặc rơi khỏi
danh mục, một test nhỏ đỏ với thông báo rõ ràng - thay vì mười test checkout cùng timeout và đọc
như thể "checkout hỏng".

## Bắt đầu

- Tài khoản đã đăng nhập.
- Danh sách sản phẩm fixture trong `e2e/fixtures/products.ts`.

## Quy trình

Với từng sản phẩm fixture:

1. Gọi API lấy sản phẩm theo id.
2. Đối chiếu tên và tồn kho.
3. Kiểm tra sản phẩm thuộc ít nhất một danh mục mà section đầu tiên của trang sản phẩm truy vấn.

## Kỳ vọng

- API trả 200, tên khớp, còn ít nhất một đơn vị bán được.
- Sản phẩm tìm được qua ô tìm kiếm của trang sản phẩm (không chỉ tồn tại trong API).

## Lỗi / regression cần bắt

- Fixture biến mất khỏi catalogue hoặc hết hàng.
- Fixture tồn tại qua API nhưng **không hiển thị** trên giao diện, nên mọi test checkout hỏng với
  thông báo khó hiểu - đúng loại lỗi từng làm [CO-006](./CO-006-multiline-partial-cart.md) mất thời gian.
