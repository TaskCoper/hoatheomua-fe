# CO-004 - Đặt hàng hẹn ngày giao kèm hoá đơn VAT cá nhân

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-004-scheduled-personal-vat-baokim.spec.ts`

Bảo vệ tổ hợp địa chỉ nhập tay + hẹn giờ + hoá đơn cá nhân + ship tính phí, và chốt quy tắc
VAT bám theo mã số thuế chứ không theo công tắc xuất hoá đơn: hoá đơn cá nhân không có VAT.

## Bắt đầu

- Sản phẩm fixture còn hàng.
- Tài khoản đã đăng nhập.
- Địa chỉ nhập tay nằm **ngoài** bán kính miễn phí ship.

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout và chuyển sang nhập địa chỉ thủ công.
3. Chọn ngày giao trong tương lai kèm khung giờ.
4. Bật hoá đơn, giữ loại Cá nhân và điền đủ năm trường.
5. Đặt hàng, rồi mở màn hình thanh toán BaoKim.

## Kỳ vọng

- Payload mang `identityNumber`, `receiptFullName`, `receiptAddress` và `taxCode = null`.
- Sidebar không có dòng VAT; server trả `vatFee = 0`.
- Đơn ở trạng thái chờ, địa chỉ nhập tay không được lưu vào tài khoản.
- Đơn hẹn giờ không được điều xe Ahamove.

## Lỗi / regression cần bắt

- Hoá đơn cá nhân bị tính VAT 8%.
- Trường của hoá đơn công ty lọt vào payload.
- Đơn hẹn giờ bị tự động điều xe.
