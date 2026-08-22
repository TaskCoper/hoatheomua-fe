# CO-024 - Webhook SePay gửi trùng

> **Layer:** Integration · **Status:** Blocked - không có webhook SePay trong repo này để phát lại · **Spec:** chưa có

Cùng một giao dịch được gửi nhiều lần chỉ được ghi nhận **đúng một** lần thanh toán. Cổng thanh
toán gửi lại webhook mỗi khi gặp lỗi hoặc timeout, nên trùng lặp là chuyện bình thường chứ
không phải trường hợp hiếm.

## Bắt đầu

- Một đơn đã ở trạng thái đã thanh toán qua webhook ([CO-022](./CO-022-sepay-webhook-success.md)).
- Cần khả năng phát lại đúng webhook đó.

## Quy trình

1. Đơn đã được thanh toán.
2. Gửi lại đúng webhook đó lần thứ hai.
3. Đọc lại đơn.

## Kỳ vọng

- Đơn vẫn đã thanh toán, với đúng một giao dịch: cùng mã, cùng số tiền, cùng thời điểm.
- Tổng tiền của đơn không đổi.

## Lỗi / regression cần bắt

- Ghi kép thanh toán, hoặc nhân đôi số tiền.
- Kích hoạt lại các tác vụ sau thanh toán (điều xe, thông báo, kế toán).
- Giao diện không thể nhìn thấy giao dịch thứ hai, nên loại lỗi này chỉ lộ ra khi đối soát.
