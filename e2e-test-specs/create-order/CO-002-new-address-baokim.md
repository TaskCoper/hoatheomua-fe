# CO-002 - Đặt hàng với địa chỉ nhập thủ công

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-002-new-address-baokim.spec.ts`

Đơn phải dùng đúng địa chỉ khách vừa gõ, không rơi về địa chỉ mặc định đã được chọn sẵn, và
địa chỉ đó không được âm thầm lưu vào tài khoản.

## Bắt đầu

- Sản phẩm fixture còn hàng.
- Tài khoản đã đăng nhập.
- Tài khoản có sẵn ít nhất một địa chỉ đã lưu, để chứng minh đơn không rơi về mặc định.

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout từ giỏ hàng.
3. Chuyển sang nhập địa chỉ thủ công sau khi địa chỉ mặc định đã được chọn sẵn.
4. Nhập địa chỉ mới nằm trong bán kính miễn phí ship.
5. Đặt hàng.

## Kỳ vọng

- Payload mang đúng địa chỉ vừa gõ, không phải địa chỉ đã lưu.
- Miễn phí ship được áp đúng; tổng tiền khớp với dữ liệu server.
- Không có request lưu địa chỉ nào được gửi trong suốt luồng checkout.

## Lỗi / regression cần bắt

- Đơn dùng địa chỉ mặc định thay vì địa chỉ khách vừa nhập.
- Checkout tự lưu địa chỉ vãng lai vào sổ địa chỉ của khách.
- Tổng tiền hiển thị khác tổng tiền server ghi nhận.
