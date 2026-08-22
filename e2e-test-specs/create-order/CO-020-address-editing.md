# CO-020 - Đổi địa chỉ giao hàng trong checkout

> **Layer:** E2E · **Status:** Deferred · **Spec:** chưa có

Các quy tắc ở tầng form khi khách thay đổi địa chỉ giao hàng: chuyển qua lại giữa địa chỉ đã
lưu và nhập tay, đổi giữa hai địa chỉ đã lưu, và đổi tỉnh/thành phải reset phường/xã.

## Bắt đầu

- Tài khoản có **hai** địa chỉ đã lưu (thêm qua fixture, không tạo tay trong test).
- API geocode được chặn.
- Trường hợp "không có địa chỉ nào" được mô phỏng bằng cách chặn API - **không bao giờ xoá
  địa chỉ thật**, vì tài khoản dùng chung cho cả suite chạy song song.

## Quy trình

1. Mở checkout.
2. Chuyển sang nhập tay rồi quay lại địa chỉ đã lưu.
3. Đổi qua lại giữa hai địa chỉ đã lưu.
4. Đổi tỉnh/thành rồi kiểm tra phường/xã.

## Kỳ vọng

- Quay lại địa chỉ đã lưu khôi phục đúng lựa chọn trước đó.
- Đổi địa chỉ áp lại cả số điện thoại người nhận lẫn dòng địa chỉ.
- Đổi tỉnh/thành xoá phường/xã cũ và mã phường/xã đi kèm.
- Khi không có địa chỉ nào, form buộc nhập tay và ẩn nút chuyển chế độ.

## Lỗi / regression cần bắt

- Phường/xã của tỉnh cũ còn sót lại - giao sai địa chỉ.
- Đổi địa chỉ nhưng số điện thoại người nhận không đổi theo.
