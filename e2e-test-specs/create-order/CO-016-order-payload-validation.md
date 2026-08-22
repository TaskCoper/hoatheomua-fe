# CO-016 - Server tự quyết phí giao hàng và giới hạn ngày giao khi tạo đơn

> **Layer:** API · **Status:** Implemented (4/9 nhóm mutation; phần còn lại xem COVERAGE-PLAN-v2 §5) · **Spec:** `e2e/create-order/co-016-order-payload-validation.spec.ts`

Chốt hợp đồng của API tạo đơn: ngày giao phải nằm trong khoảng cho phép, và **phí giao hàng do
server tính**, không lấy theo số client gửi lên. Mọi case E2E khác chỉ gửi được payload mà form
chịu tạo ra, nên không thể biết giới hạn là thật hay chỉ là trang trí trên giao diện.

## Bắt đầu

- Một payload **thật** ghi lại từ một lượt checkout trên giao diện - endpoint cần toạ độ sống và
  mã sản phẩm Nhanh.vn mà repo không tự dựng được.
- Dùng địa chỉ **ngoài** bán kính miễn phí ship; nếu không, phí server tính bằng 0 và các bước về
  phí ship trở nên vô nghĩa.

## Quy trình

1. Đặt một đơn qua giao diện và ghi lại payload làm mốc đối chứng.
2. Đổi **đúng một** trường mỗi lần rồi gọi lại API tạo đơn.
3. Đọc lại đơn vừa tạo để so với mốc đối chứng.

## Kỳ vọng

- Ngày giao trong quá khứ hoặc quá 7 ngày: bị từ chối 422.
- Ngày giao hợp lệ: được lưu đúng như gửi lên.
- Phí giao hàng client gửi lên - dù là `0` hay một số cực lớn - đều bị bỏ qua; đơn luôn lưu đúng
  phí server tự tính cho payload gốc.
- Tổng tiền = tiền hàng + phí ship + VAT, nên phí bị bỏ qua không thể rò vào số tiền khách phải trả.
- Chỉ kiểm tra `status` và `messageCode`: ngoài môi trường Development, server không trả chi tiết lỗi.

## Lỗi / regression cần bắt

- Server tin phí giao hàng do client gửi - khách tự đặt giá ship cho mình.
- Giới hạn ngày giao chỉ tồn tại ở giao diện, gọi thẳng API là qua được.
- **KNOWN GAP đang được pin:** khung giờ không tồn tại vẫn được nhận khi tạo đơn và chỉ vỡ trong
  webhook thanh toán - tức là sau khi khách đã trả tiền, đơn kẹt ở trạng thái chờ còn tiền thì
  đã đi. Nếu sau này thêm kiểm tra lúc tạo đơn, bước này sẽ đỏ và phải đổi sang mong đợi 422.
