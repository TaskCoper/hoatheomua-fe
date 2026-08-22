# CO-026 - Huỷ đơn của tài khoản khác

> **Layer:** API · **Status:** Blocked - chưa có tài khoản test thứ hai · **Spec:** chưa có

Chỉ chủ đơn mới được huỷ đơn của mình. Hàm huỷ ở backend hiện chỉ lọc theo `Id`, không kiểm tra
chủ sở hữu, nên case này tồn tại để chứng minh lỗ hổng đó có khai thác được hay không.

## Bắt đầu

- Cần tài khoản thứ hai đã đăng ký và xác thực email, không liên quan gì tới tài khoản thứ nhất.
  `E2E_USER2_EMAIL` / `E2E_USER2_PASSWORD` có trong `.env` nhưng đang **rỗng** - case phải tự skip
  khi chưa cấu hình, để suite không đỏ vì lý do môi trường.

## Quy trình

1. Tài khoản A tạo một đơn ở trạng thái chờ.
2. Tài khoản B gọi API huỷ đơn đó bằng phiên của chính mình.
3. Tài khoản B thử đọc chi tiết đơn đó.

## Kỳ vọng

- Yêu cầu huỷ bị từ chối (403/404) và đơn vẫn ở trạng thái chờ.
- Đọc chi tiết đơn chéo tài khoản cũng bị từ chối.

## Lỗi / regression cần bắt

- Bất kỳ khách nào đã đăng nhập cũng huỷ được đơn của người khác.
- Nếu test đỏ vì huỷ **thành công**, đó là lỗ hổng đã được tái hiện, không phải test sai - đừng
  viết assertion theo hành vi hỏng trước khi xác nhận nó thật sự hỏng.
