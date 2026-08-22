# CO-025 - Webhook SePay không hợp lệ

> **Layer:** Integration · **Status:** Blocked - không có webhook SePay trong repo này, quy tắc xác thực chưa rõ · **Spec:** chưa có

Đây là ranh giới bảo mật của dòng tiền vào. Một webhook giả mạo hoặc sai - đơn không tồn tại,
sai tham chiếu, sai chữ ký, sai số tiền - không bao giờ được phép đánh dấu đơn là đã thanh toán.

## Bắt đầu

- Một đơn đang chờ làm mục tiêu, cùng vài đơn đối chứng không liên quan.
- Cần gửi được webhook tuỳ ý tới backend.

## Quy trình

1. Gửi lần lượt từng biến thể webhook không hợp lệ.
2. Đọc lại đơn mục tiêu và toàn bộ đơn đối chứng sau mỗi lần.

## Kỳ vọng

- Đơn mục tiêu vẫn ở trạng thái chờ, không có giao dịch.
- Không đơn nào khác đổi trạng thái.

## Lỗi / regression cần bắt

- Bất kỳ webhook không xác thực nào cũng đổi được trạng thái đơn - ai biết endpoint là lấy được
  hàng miễn phí.
- Chỉ kiểm tra một biến thể là không đủ: mỗi kiểu sai đi qua một nhánh xác thực khác nhau.
