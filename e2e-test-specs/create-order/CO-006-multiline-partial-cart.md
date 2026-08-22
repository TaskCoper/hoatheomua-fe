# CO-006 - Đặt một phần giỏ hàng thành đơn nhiều sản phẩm

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-006-multiline-partial-cart.spec.ts`

Khách chỉ tick một phần các dòng trong giỏ. Đơn phải gồm đúng những dòng đó, định giá theo mã
sản phẩm Nhanh.vn, và sau khi đặt xong chỉ những dòng đó bị xoá khỏi giỏ.

## Bắt đầu

- Ba dòng hàng còn hàng: hai biến thể của sản phẩm chính và một sản phẩm phụ.
- Tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.

## Quy trình

1. Thêm ba dòng vào giỏ với số lượng khác nhau.
2. Tick hai trong ba dòng rồi sang checkout.
3. Đặt hàng.
4. Quay lại giỏ hàng.

## Kỳ vọng

- Sidebar chỉ liệt kê hai dòng đã tick, đúng số lượng và đúng tạm tính.
- Payload dùng `nhanhProductId` cho từng dòng, không dùng UUID nội bộ.
- Chi tiết đơn hiển thị đủ hai dòng và đúng số lượng đã chọn (`x2`).
- Server lưu đúng hai dòng; `productFee` = Σ(giá × số lượng); tổng tiền khớp UI.
- Giỏ chỉ mất hai dòng đã đặt; dòng còn lại giữ nguyên số lượng và vẫn chọn được.

## Lỗi / regression cần bắt

- Đơn mang cả dòng khách không tick.
- Giá được tính theo UUID nội bộ thay vì mã Nhanh.vn (backend định giá bằng 0).
- Checkout xoá sạch giỏ, hoặc xoá theo sản phẩm thay vì theo dòng, làm mất biến thể chưa mua.
