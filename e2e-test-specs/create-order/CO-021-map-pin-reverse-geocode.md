# CO-021 - Ghim bản đồ và reverse geocode

> **Layer:** E2E · **Status:** Deferred · **Spec:** chưa có

Toạ độ dùng để báo giá phải phản ánh đúng vị trí khách chọn trên bản đồ. Đây là nửa "tích hợp"
của việc sửa địa chỉ, tách khỏi [CO-020](./CO-020-address-editing.md) để nửa tiền định không bị nửa bản đồ chặn lại.

## Bắt đầu

- Một địa chỉ đã resolve được toạ độ, cùng một độ lệch đã biết.
- Geocode để **thật** - đây chính là đối tượng kiểm thử.

## Quy trình

1. Mở checkout ở chế độ nhập địa chỉ tay.
2. Xoá ô gợi ý địa chỉ rồi bấm tiếp tục.
3. Kéo ghim bản đồ trong bán kính cho phép.
4. Kéo ghim ra ngoài bán kính.

## Kỳ vọng

- Kéo ghim ghi ngược lại dòng địa chỉ, phường/xã, tỉnh/thành, và toạ độ mới đi vào payload báo giá.
- Ghim ngoài bán kính hiện cảnh báo "điểm này quá xa địa chỉ của bạn" và giữ nguyên toạ độ cũ.
- Chỉ kiểm tra trạng thái form sau thao tác, không bao giờ kiểm tra nội bộ của bản đồ.

## Lỗi / regression cần bắt

- **KNOWN GAP đã được pin:** xoá ô gợi ý làm toạ độ về `0,0` nhưng bước 1 **vẫn cho đi tiếp** và
  báo giá Ahamove với toạ độ `0,0`. Đây là hành vi hiện tại (đã pin ở `UT-004`), không phải kết
  quả mong muốn - viết assertion theo hướng "bị chặn" sẽ đỏ và bị hiểu nhầm là test hỏng.
- Toạ độ sau khi kéo ghim không đi vào báo giá, khách bị tính phí theo vị trí cũ.
