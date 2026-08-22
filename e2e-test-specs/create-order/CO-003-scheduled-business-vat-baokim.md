# CO-003 - Đặt hàng hẹn ngày giao kèm hoá đơn VAT công ty

> **Layer:** E2E · **Status:** Implemented · **Spec:** `e2e/create-order/co-003-scheduled-business-vat-baokim.spec.ts`

Bảo vệ luồng có giá trị cao nhất: hẹn ngày giao, xuất hoá đơn công ty, và phí giao hàng có
tính tiền. Ba quy tắc độc lập gặp nhau ở đây - mã hoá ngày giao, bộ trường bắt buộc của hoá
đơn công ty, và nhánh tính phí khi địa chỉ nằm ngoài bán kính miễn phí ship.

## Bắt đầu

- Sản phẩm fixture còn hàng.
- Tài khoản đã đăng nhập.
- Địa chỉ đã lưu nằm **ngoài** bán kính miễn phí ship.
- Có mã số thuế công ty hợp lệ.

## Quy trình

1. Thêm sản phẩm vào giỏ.
2. Mở checkout và chọn địa chỉ đã lưu.
3. Chọn ngày giao trong tương lai kèm khung giờ.
4. Bật hoá đơn, chọn loại Công ty và nhập mã số thuế.
5. Đặt hàng.

## Kỳ vọng

- Panel tra cứu mã số thuế (VietQR) hiện đúng tên và địa chỉ doanh nghiệp.
- Sidebar hiện VAT 8% và phí ship đầy đủ, không có dòng giảm giá miễn phí ship.
- Payload mang `taxCode`, `orderTime` là unix **giây** trong tương lai và `tagIds` chứa khung giờ;
  không mang trường của hoá đơn cá nhân.
- Server trả `vatFee > 0` và không điều xe Ahamove cho đơn hẹn giờ.

## Lỗi / regression cần bắt

- Ngày giao gửi sai đơn vị (mili giây) hoặc bị rơi về `0`, biến đơn hẹn giờ thành giao ngay.
- Hoá đơn công ty thiếu trường bắt buộc, hoặc lẫn trường của hoá đơn cá nhân.
- Miễn phí ship bị áp nhầm cho địa chỉ ngoài bán kính.
- Đơn hẹn giờ bị tự động điều xe Ahamove.
