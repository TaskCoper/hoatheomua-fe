# CO-019 - Chặn bước 1 khi thông tin giao hàng không hợp lệ

> **Layer:** E2E · **Status:** Deferred · **Spec:** chưa có

Bước 1 của checkout kiểm tra dữ liệu bằng một cơ chế **riêng**: tự parse rồi tự gán lỗi vào
từng trường, khác hẳn bước 2. Đoạn ánh xạ lỗi thủ công đó không được test ở đâu khác - schema
có thể hoàn toàn đúng trong khi lỗi lại được gán sai trường, hoặc không gán vào đâu cả.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Dùng chế độ nhập địa chỉ thủ công.
- API geocode được chặn để gợi ý địa chỉ ổn định ở bước sửa lại.

## Quy trình

1. Thêm sản phẩm vào giỏ và mở checkout.
2. Chuyển sang nhập địa chỉ thủ công.
3. Bấm tiếp tục lần lượt với: form trống, số điện thoại sai định dạng, ghi chú vượt 500 ký tự.
4. Sửa lại cho hợp lệ và tiếp tục.

## Kỳ vọng

- Mỗi lỗi hiện đúng ở trường tương ứng.
- Không có request báo giá Ahamove nào được gửi khi bước 1 chưa hợp lệ.
- Sau khi sửa, khách sang được bước 2. Case dừng tại đây, không tạo đơn.

## Lỗi / regression cần bắt

- Lỗi được gán sai trường hoặc không gán vào trường nào - khách không biết phải sửa gì.
- Bước 1 vẫn gọi báo giá Ahamove dù dữ liệu chưa hợp lệ.
