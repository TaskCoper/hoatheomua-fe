# CO-017 - Đặt hàng chọn ngày, không chọn khung giờ

> **Layer:** E2E · **Status:** Deferred - cần một lượt chạy Tier B thủ công mới có giá trị · **Spec:** chưa có

Tổ hợp giao hàng thứ tư, đối xứng với [CO-005](./CO-005-slot-only-same-day.md): chỉ riêng `orderTime > 0` đã đủ để đơn được
coi là hẹn giờ và không được tự động điều xe.

## Bắt đầu

- Sản phẩm fixture còn hàng.
- Tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.
- Ngày giao = hôm nay + 2 (đủ xa hai đầu khoảng hôm nay…+7 để không trôi qua nửa đêm).

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout và chọn địa chỉ đã lưu.
3. Chọn ngày giao, không mở phần chọn khung giờ.
4. Đặt hàng.

## Kỳ vọng

- Sidebar hiện ngày giao và **không** có dòng thời gian giao.
- Payload có `orderTime > 0` và `tagIds` rỗng.
- Chi tiết đơn đọc ra ngày giao thay vì "Ngay sau khi thanh toán".
- Ở Tier B, đơn đã thanh toán vẫn không được điều xe Ahamove.

## Lỗi / regression cần bắt

- Đơn chỉ có ngày giao bị xử lý như đơn giao ngay và bị điều xe.
- Ngày giao không xuất hiện trên chi tiết đơn.
