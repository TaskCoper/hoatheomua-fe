# CO-022 - Webhook SePay xác nhận thanh toán thành công

> **Layer:** Integration · **Status:** Blocked - webhook SePay không có trong repo này và hiện đang hỏng · **Spec:** chưa có

Một lần chuyển khoản SePay được xác nhận phải chuyển đơn từ chờ sang đã thanh toán và gắn kèm
thông tin giao dịch.

## Bắt đầu

- Một đơn SePay ở trạng thái chờ, đã sinh mã QR.
- Cần khả năng kích hoạt webhook SePay tới backend - chưa có, nên case đang Blocked.

## Quy trình

1. Tạo đơn SePay.
2. Gửi webhook xác nhận thanh toán.
3. Quan sát trang chi tiết đơn.

## Kỳ vọng

- Trang chi tiết tự đổi sang đã thanh toán **mà không cần tải lại**, ẩn QR và hiện thông tin
  chuyển khoản.
- API trả trạng thái `Paid` kèm giao dịch có số tiền bằng tổng đơn.

## Lỗi / regression cần bắt

- Đơn đã nhận tiền nhưng không đổi trạng thái, khách tưởng chưa thanh toán và trả lần nữa.
- Số tiền giao dịch không khớp tổng đơn.
