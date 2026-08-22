# CO-018 - Địa chỉ nằm đúng ranh giới miễn phí ship

> **Layer:** E2E · **Status:** Blocked - chưa có dữ liệu ranh giới tiền định · **Spec:** chưa có

Chốt tính "bao gồm" của quy tắc miễn phí ship: khoảng cách **bằng đúng** ngưỡng thì vẫn được
miễn phí, và client lẫn server phải cùng dùng `<=`. Đây là khoảng cách duy nhất phân biệt được
hai toán tử; mọi case trong và ngoài bán kính đều pass với cả `<` lẫn `<=`.

## Bắt đầu

- Sản phẩm fixture còn hàng, tài khoản đã đăng nhập.
- Cần một môi trường test ghim được `ahamove.free_ship` **và** một địa chỉ có khoảng cách
  Ahamove đúng bằng ngưỡng đó. Cả hai là việc hạ tầng, chưa có - nên case đang Blocked.

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout với địa chỉ nằm đúng ranh giới.
3. Giao ngay, không xuất hoá đơn.
4. Đặt hàng.

## Kỳ vọng

- Phí ship được miễn ở đúng điểm bằng nhau.
- Sidebar hiện phí vận chuyển gốc kèm dòng giảm giá bằng đúng phí đó.
- Tổng tiền không gồm phí ship; đơn được tạo với `shippingFee = 0`.
- Server áp cùng quy tắc, không lệch với client.

## Lỗi / regression cần bắt

- Đổi `<=` thành `<` khiến mọi khách đứng đúng ranh giới âm thầm bị tính phí ship.
- Client và server dùng hai toán tử khác nhau: UI hứa miễn phí còn server vẫn thu tiền, hoặc ngược lại.
