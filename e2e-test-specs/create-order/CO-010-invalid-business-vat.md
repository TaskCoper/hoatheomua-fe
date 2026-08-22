# CO-010 - Hoá đơn công ty thiếu thông tin bắt buộc

> **Layer:** E2E · **Status:** Implemented (rút gọn - ma trận trường bắt buộc đã chuyển sang UT-003) · **Spec:** `e2e/create-order/co-010-invalid-business-vat.spec.ts`

Cổng kiểm tra hoá đơn công ty phải chặn được việc đặt hàng khi thiếu trường bắt buộc, và phải
mở lại được ngay sau khi khách điền đủ.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm trong bán kính miễn phí ship.
- API tra cứu mã số thuế được chặn (case này không quan tâm panel tra cứu).

## Quy trình

1. Vào checkout tới bước thanh toán.
2. Bật hoá đơn và chọn tab Công ty.
3. Bấm đặt hàng khi các trường bắt buộc còn trống.
4. Điền đủ và đặt hàng lại.

## Kỳ vọng

- Lỗi hiển thị ngay dưới ô mã số thuế, kèm toast.
- **Không** có request tạo đơn nào được gửi.
- Sau khi điền đủ, đơn được tạo và server chấp nhận.

## Lỗi / regression cần bắt

- Cổng kiểm tra bị vô hiệu, đơn thiếu thông tin hoá đơn vẫn được tạo.
- Cổng bị kẹt đóng: khách điền đúng vẫn không đặt được hàng.
- Lỗi có trong schema nhưng không hiển thị ra giao diện, khách không biết phải sửa gì.
- Nút submit nuốt cú click đầu tiên trông giống hệt "đã bị chặn đúng": phải kiểm tra lỗi và
  toast **trước** khi kiểm tra số request.
