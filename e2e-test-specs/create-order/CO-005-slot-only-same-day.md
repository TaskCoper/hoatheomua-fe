# CO-005 - Đặt hàng giao trong ngày theo khung giờ

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-005-slot-only-same-day-baokim.spec.ts`

Chốt tổ hợp giao hàng thứ ba: chỉ chọn khung giờ, không chọn ngày. Lịch checkout gộp "hôm nay"
thành `orderTime = 0`, nên khung giờ là tín hiệu duy nhất cho biết đơn có hẹn giờ.

## Bắt đầu

- Sản phẩm fixture còn hàng.
- Tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout và chọn địa chỉ đã lưu.
3. Chỉ chọn khung giờ, không chọn ngày giao.
4. Đặt hàng.

## Kỳ vọng

- Payload có `orderTime = 0` và `tagIds` chứa đúng khung giờ đã chọn.
- Chi tiết đơn hiển thị khung giờ, không hiển thị "Ngay sau khi thanh toán".
- Server không điều xe Ahamove - đơn có khung giờ vẫn là đơn hẹn giờ.
- Miễn phí ship vẫn được áp đúng.

## Lỗi / regression cần bắt

- Khung giờ bị bỏ rơi khỏi payload, biến đơn thành giao ngay.
- Đơn có khung giờ bị tự động điều xe.
