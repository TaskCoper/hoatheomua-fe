# CO-013 - Phương thức thanh toán luôn đi theo cổng thanh toán

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-013-gateway-payment-method-coupling.spec.ts`

Mỗi cổng thanh toán chỉ cho phép đúng phương thức của nó, và lựa chọn phải được viết lại theo
**cả hai chiều** khi khách đổi cổng. Kiểm tra một chiều sẽ pass với cả bản cài đặt chỉ xử lý
chiều đi mà bỏ quên chiều về.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập, địa chỉ đã lưu.
- Case này **không tạo đơn**.

## Quy trình

1. Vào checkout tới bước thanh toán.
2. Kiểm tra lựa chọn mặc định.
3. Đổi sang SePay.
4. Đổi ngược lại BaoKim.

## Kỳ vọng

- Mặc định là BaoKim với phương thức VA.
- Đổi sang SePay: VNPay QR được chọn, VA **không còn được render** (vắng mặt, chứ không phải chỉ
  bỏ tick).
- Đổi lại BaoKim: VA được chọn, VNPay QR không còn được render.

## Lỗi / regression cần bắt

- Lựa chọn bị kẹt ở phương thức mà cổng đang chọn không hỗ trợ - server vẫn nhận, tạo ra đơn ghi
  sai cặp cổng/phương thức mà không báo lỗi ở đâu cả.
