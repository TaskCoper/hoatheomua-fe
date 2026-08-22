# CO-011 - Hoá đơn cá nhân thiếu thông tin bắt buộc

> **Layer:** E2E · **Status:** Implemented (rút gọn - ma trận trường bắt buộc đã chuyển sang UT-003) · **Spec:** `e2e/create-order/co-011-invalid-personal-vat.spec.ts`

Giống [CO-010](./CO-010-invalid-business-vat.md) nhưng ở nhánh khách lẻ thực sự dùng, đồng thời chốt thêm một hợp đồng phía
server: đơn hoá đơn cá nhân không kèm VAT.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.

## Quy trình

1. Vào checkout tới bước thanh toán.
2. Bật hoá đơn và xác nhận tab Cá nhân đang được chọn sẵn (không bấm chọn, để phát hiện nếu
   mặc định bị đổi).
3. Bấm đặt hàng khi các trường bắt buộc còn trống.
4. Điền đủ năm trường và đặt hàng lại.

## Kỳ vọng

- Lỗi hiển thị dưới trường bắt buộc, kèm toast.
- **Không** có request tạo đơn nào được gửi.
- Sau khi điền đủ, đơn được tạo với `invoiceType: Personal`, `taxCode: null`, và server trả
  `vatFee = 0`.

## Lỗi / regression cần bắt

- Tab mặc định bị đổi mà không ai phát hiện.
- Cổng kiểm tra bị vô hiệu, hoặc bị kẹt đóng.
- Hoá đơn cá nhân bị tính VAT.
