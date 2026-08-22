# CO-014 - Đơn bỏ dở thanh toán vẫn giữ nguyên trạng thái chờ

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-014-abandoned-payment-baokim.spec.ts`

Đơn chưa được xác nhận thanh toán phải giữ nguyên trạng thái chờ. Hệ thống không có trạng thái
"thanh toán thất bại" riêng, nên thất bại và bỏ ngang là không phân biệt được - điều duy nhất
phải đúng là đơn không bao giờ tự chuyển sang đã thanh toán.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.

## Quy trình

1. Tạo một đơn BaoKim.
2. Mở cổng thanh toán rồi bỏ ngang.
3. Quay lại trang chi tiết đơn.

## Kỳ vọng

- Đơn vẫn ở trạng thái chờ xác nhận qua nhiều lần đọc liên tiếp, không phải một lần may mắn.
- Trang chi tiết vẫn tiếp tục poll `GET /orders/{id}/status` - đây vừa là hợp đồng cần giữ,
  vừa là đồng hồ đo cửa sổ quan sát (chờ đủ 3 lần poll thay vì `sleep` cứng).
- Không có giao dịch nào được ghi nhận.
- Các trường theo dõi Ahamove vẫn trống - đơn chưa trả tiền thì không được điều xe.
- Khách vẫn còn cả nút thanh toán lại lẫn nút huỷ đơn.

## Lỗi / regression cần bắt

- Đơn tự chuyển sang đã thanh toán khi chưa có xác nhận từ cổng thanh toán.
- Đơn chưa thanh toán bị điều xe.
- Khách mất đường thử lại hoặc huỷ đơn sau khi bỏ ngang.
