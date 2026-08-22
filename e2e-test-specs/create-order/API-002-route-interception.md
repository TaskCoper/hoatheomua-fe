# API-002 - Chặn được API geocode autocomplete

> **Layer:** API · **Status:** Temporary - scaffolding, có thể xoá khi kỹ thuật này đã dùng ổn định ở ba case thật · **Spec:** `e2e/create-order/api-002-route-interception.spec.ts`

Chứng minh kỹ thuật chặn request hoạt động đúng với hình dạng request thật của ứng dụng, trước
khi [CO-007](./CO-007-checkout-entry-guards.md), [CO-008](./CO-008-freeship-config-unavailable.md), [CO-012](./CO-012-step-navigation-failures.md), [CO-020](./CO-020-address-editing.md) và [CO-021](./CO-021-map-pin-reverse-geocode.md) cùng phụ thuộc vào nó. Case này
không bảo vệ hành vi nào của khách hàng.

## Bắt đầu

- Tài khoản đã đăng nhập, có địa chỉ đã lưu.
- Đang ở bước 1 của checkout, chế độ nhập địa chỉ thủ công.

## Quy trình

1. Vào bước 1 của checkout.
2. Chặn API geocode autocomplete và trả về danh sách gợi ý cố định.
3. Gõ vào ô địa chỉ.
4. Gỡ chặn và gõ lại.

## Kỳ vọng

- Danh sách gợi ý đúng bằng dữ liệu đã trả về.
- Route thực sự bị gọi.
- Sau khi gỡ chặn, gợi ý thật quay lại - stub không rò rỉ sang các bước sau.

## Lỗi / regression cần bắt

- Pattern chặn không khớp: mọi assertion phía sau trở nên vô nghĩa trong khi test vẫn xanh.
- Stub bật quá sớm (ở phạm vi file thay vì trong thân test) làm hỏng dữ liệu fixture, vì fixture
  địa chỉ cũng dùng chính component autocomplete này.
