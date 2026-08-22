# CO-023 - Webhook SePay không được gửi

> **Layer:** Integration · **Status:** Blocked - không dựng được trạng thái "đã trả tiền nhưng chưa xác nhận" · **Spec:** chưa có

Khi tiền đã chuyển nhưng không có xác nhận nào tới, đơn tuyệt đối không được đánh dấu là đã
thanh toán. Đây là tình huống tệ nhất với khách hàng, và điều duy nhất bắt buộc phải đúng là
hệ thống không tự suy diễn.

## Bắt đầu

- Một đơn SePay ở trạng thái chờ, đã sinh mã QR.
- Webhook không tới. Không có cách nào tạo ra trạng thái này từ repo hiện tại, nên case Blocked.

## Quy trình

1. Tạo đơn SePay.
2. Chuyển tiền nhưng không để webhook tới.
3. Theo dõi đơn.

## Kỳ vọng

- Đơn ở trạng thái chờ vô thời hạn, QR vẫn hiện.
- Khách vẫn còn cả đường thanh toán lại lẫn đường huỷ đơn.
- API luôn trả `Pending` và không có giao dịch.

## Lỗi / regression cần bắt

- Đơn được đánh dấu đã thanh toán từ một nguồn tin không đáng tin cậy.
- Khách bị kẹt hoàn toàn, không có cơ chế phục hồi nào (đây là hệ quả đang được ghi nhận, không
  phải lỗi hồi quy).
