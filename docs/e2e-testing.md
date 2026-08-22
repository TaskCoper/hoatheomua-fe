# Lệnh chạy E2E test (Playwright)

Các lệnh dưới đây đã được thêm vào `package.json` để chạy nhanh qua `pnpm run <tên lệnh>`, thay vì phải gõ lại `pnpm exec playwright ...` mỗi lần.

## `pnpm run test:e2e`

**Là gì:** Chạy toàn bộ test trong thư mục `e2e/` trên cả 3 trình duyệt (Chromium, Firefox, WebKit) như cấu hình trong `playwright.config.ts`, chạy ngầm (headless).

**Khi nào dùng:** Trước khi mở PR, hoặc sau khi sửa code xong muốn kiểm tra nhanh có test nào gãy không. Đây cũng chính là lệnh mà CI (`.github/workflows/playwright.yml`) chạy, nên chạy trước ở local sẽ đỡ mất công chờ CI báo lỗi.

**Vì sao cần:** Là lệnh cơ bản nhất, dùng hàng ngày trong lúc phát triển tính năng có test e2e.

## `pnpm run test:e2e:ui`

**Là gì:** Mở Playwright UI Mode - một cửa sổ trực quan cho xem danh sách test, chạy từng test riêng lẻ, xem timeline, screenshot, DOM snapshot theo từng bước.

**Khi nào dùng:** Khi đang viết test mới hoặc debug một test cụ thể, cần xem chính xác bước nào fail và vì sao (thay vì đọc log text).

**Vì sao cần:** Nhanh hơn nhiều so với việc chạy lại toàn bộ suite rồi mò log để tìm lỗi.

## `pnpm run test:e2e:headed`

**Là gì:** Chạy test nhưng mở trình duyệt thật lên (không headless), để mắt thấy trực tiếp thao tác của Playwright trên trang.

**Khi nào dùng:** Khi muốn quan sát bằng mắt xem thao tác click/gõ/điều hướng có đúng ý đồ không, đặc biệt với animation hoặc UI phức tạp mà UI Mode không lột tả hết.

**Vì sao cần:** Có những lỗi (ví dụ do animation, race condition khi render) chỉ lộ ra khi nhìn trình duyệt chạy thật.

## `pnpm run test:e2e:debug`

**Là gì:** Chạy Playwright ở chế độ debug - mở Playwright Inspector, tự động dừng lại ở đầu mỗi test để bước qua (step-through) từng lệnh một, giống debugger của code thường.

**Khi nào dùng:** Khi một test fail flaky hoặc không rõ lý do, cần dừng lại đúng điểm để kiểm tra selector, giá trị, trạng thái trang.

**Vì sao cần:** Đào sâu hơn `--headed`, cho phép tạm dừng và soi kỹ từng bước thay vì xem lướt qua.

## `pnpm run test:e2e:report`

**Là gì:** Mở lại báo cáo HTML (`playwright-report/`) của lần chạy test gần nhất - bao gồm kết quả pass/fail, trace, screenshot lỗi.

**Khi nào dùng:** Sau khi `test:e2e` chạy xong (đặc biệt khi có test fail) và muốn xem chi tiết mà không cần chạy lại test.

**Vì sao cần:** Trace/screenshot lỗi rất hữu ích để hiểu tại sao test fail, kể cả khi không có mặt lúc test chạy (ví dụ xem report do CI tải lên).

## `pnpm run test:e2e:install`

**Là gì:** Cài đặt các trình duyệt (Chromium, Firefox, WebKit) và dependency hệ thống mà Playwright cần để chạy test.

**Khi nào dùng:** Lần đầu setup máy mới, sau khi clone repo, hoặc sau khi nâng cấp version `@playwright/test`.

**Vì sao cần:** Playwright không dùng trình duyệt cài sẵn trên máy - nó cần bộ binary riêng tương thích với version đang dùng. Thiếu bước này thì các lệnh test ở trên sẽ báo lỗi thiếu browser.
