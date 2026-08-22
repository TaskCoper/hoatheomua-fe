# CO-008 - Mất cấu hình ngưỡng miễn phí ship

> **Layer:** E2E · **Status:** Known Gap (pin hành vi hiện tại) · **Spec:** `e2e/create-order/co-008-freeship-config-unavailable.spec.ts`

Ghi nhận hành vi hiện tại: toàn bộ quyền miễn phí ship phụ thuộc vào một con số đọc lúc chạy
(`ahamove.free_ship`) và **không có giá trị dự phòng**. Khi không đọc được số đó, khách nằm
trong bán kính vẫn bị tính đủ phí ship - im lặng, không lỗi, không toast.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm **trong** bán kính miễn phí ship.
- API cấu hình public nhóm `ahamove` bị chặn, theo hai biến thể: nhóm rỗng, và ngưỡng không
  phải là số.

## Quy trình

1. Chặn API cấu hình **trước** khi vào checkout (checkout đọc cấu hình ngay khi mount).
2. Thêm sản phẩm vào giỏ và mở checkout.
3. Sang bước thanh toán với báo giá Ahamove thật.
4. Đọc sidebar.

## Kỳ vọng

- Phí vận chuyển hiển thị đúng bằng phí Ahamove báo về.
- Dòng giảm giá miễn phí ship **không** xuất hiện.
- Tổng tiền cộng cả phí ship.
- Không có toast hay thông báo lỗi nào.
- Route cấu hình thực sự bị gọi - nếu không, mọi assertion phía trên đều vô nghĩa.

## Lỗi / regression cần bắt

- Sự cố hạ tầng âm thầm chuyển chi phí sang khách hàng (chính là hành vi đang được pin ở đây).
- Nếu sau này thêm giá trị dự phòng mà quên cập nhật case, test sẽ đỏ và phải viết lại theo
  hướng "miễn phí ship vẫn được giữ".
- Đối chứng là [CO-001](./CO-001-saved-address-baokim.md): cùng địa chỉ, cấu hình thật, kết quả phải ngược lại hoàn toàn.
