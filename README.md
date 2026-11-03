# Website Tri Thức (trithucsoft.vn) có trang quản trị

Website mới của Công ty Cổ phần Tin học Tri Thức, dựng theo bản thiết kế đã duyệt. Mọi nội dung hiển thị (logo, màu, thông điệp, banner, menu, chân trang, giải pháp, dự án, tin tức, thông tin liên hệ, SEO) đều chỉnh trong trang quản trị, không cần sửa mã.

Toàn bộ công nghệ là mã nguồn mở:

| Thành phần | Công nghệ | Giấy phép |
|---|---|---|
| Máy chủ web | Node.js 22, Express 5 | MIT |
| Giao diện | EJS, HTML dựng sẵn trên máy chủ (tốt cho SEO) | Apache 2.0 |
| Cơ sở dữ liệu | PostgreSQL 16 | PostgreSQL License |
| Trình soạn thảo | Quill 2 | BSD-3 |
| Bảo mật | helmet, bcryptjs, sanitize-html, express-rate-limit | MIT |
| Phông chữ | Be Vietnam Pro | SIL OFL |

## Chạy nhanh bằng Docker (khuyến nghị)

```bash
cp .env.example .env          # rồi điền SESSION_SECRET, ADMIN_PASSWORD, BASE_URL
docker compose up -d --build
```

Mở `http://<máy-chủ>:3000`. Trang quản trị ở `/quan-tri`, đăng nhập bằng `ADMIN_EMAIL` và `ADMIN_PASSWORD` đã đặt trong `.env`. Nếu bỏ trống `ADMIN_PASSWORD`, mật khẩu ngẫu nhiên được in ra ở lần chạy đầu (`docker compose logs web`).

Khi chạy thử bằng `http://` (chưa có HTTPS), đặt `COOKIE_SECURE=0` trong `.env`, nếu không sẽ không đăng nhập được.

## Chạy trực tiếp (không Docker)

Cần Node.js 20 trở lên và PostgreSQL.

```bash
npm ci
cp .env.example .env          # sửa DATABASE_URL trỏ tới PostgreSQL
npm start                     # tự tạo bảng và nạp dữ liệu khởi tạo ở lần đầu
```

Kiểm thử tự động: `TEST_DATABASE_URL=postgres://... npm test` (dùng một cơ sở dữ liệu riêng, bài kiểm thử sẽ xóa sạch nó).

## Trang quản trị làm được gì

| Mục | Nội dung quản lý |
|---|---|
| Cấu hình website | Logo, logo nền tối, favicon, màu chủ đạo, dòng mô tả dưới logo, nút đầu trang, thanh thông báo, tiêu đề các mục trang chủ, thông tin pháp lý, hotline, email, bản đồ, mạng xã hội, chân trang, SEO, mã đo lường, llms.txt |
| Banner trang chủ | Thông điệp chính, mô tả, ảnh, 2 nút. Nhiều banner thì tự chuyển |
| Menu và chân trang | Menu đầu trang, 2 cột liên kết chân trang, dòng liên kết pháp lý |
| Khối trang chủ | Số liệu, 3 mảng hoạt động, 7 dịch vụ tư vấn, quy trình, phần mềm bản quyền, đổi mới sáng tạo, điểm mạnh, chứng nhận, văn phòng |
| Giải pháp | Trang chi tiết từng giải pháp: bài toán, phân hệ, kết quả, tuân thủ, câu hỏi thường gặp, tài liệu PDF, Live Demo |
| Dự án, Tin tức, Trang tĩnh | Soạn thảo có định dạng, ảnh, SEO riêng, bản nháp, hẹn giờ đăng |
| Khách hàng, Cảm nhận | Logo và lời cảm nhận hiển thị trên trang chủ |
| Yêu cầu tư vấn | Xem, đổi trạng thái, ghi chú, xuất CSV mở bằng Excel; báo email nếu cấu hình SMTP |
| Thư viện ảnh, tệp | Tải lên, chép đường dẫn, xóa |
| Tài khoản | Quản trị viên (toàn quyền) và Biên tập viên (chỉ nội dung) |

Trang Tổng quan liệt kê mọi chỗ còn ghi trong ngoặc vuông, ví dụ `[X]%`, để thay bằng thông tin thật.

## SEO và hiệu năng có sẵn

- HTML dựng trên máy chủ, mỗi trang có tiêu đề, mô tả, canonical, ảnh chia sẻ riêng
- Đường dẫn tiếng Việt không dấu, tự sinh từ tiêu đề
- `sitemap.xml`, `robots.txt`, `llms.txt` tự sinh
- Dữ liệu có cấu trúc Schema.org: Organization, BreadcrumbList, Article, FAQPage
- Cho phép phóng to trên điện thoại, điều hướng bằng bàn phím, tôn trọng chế độ giảm chuyển động
- Nút Gọi ngay và Zalo nổi trên điện thoại

## Bảo mật

- Mật khẩu băm bcrypt, khóa tạm khi đăng nhập sai nhiều lần
- Chống giả mạo yêu cầu (CSRF) trên mọi form, chống spam form liên hệ (giới hạn tần suất, bẫy robot)
- Lọc mã độc trong nội dung soạn thảo; tệp tải lên chỉ nhận ảnh và PDF, SVG bị chặn chạy mã
- Tiêu đề bảo mật HTTP (CSP, HSTS khi chạy HTTPS) qua helmet
- Form liên hệ có ô đồng ý theo Nghị định 13/2023/NĐ-CP

## Triển khai chính thức

1. Đặt máy chủ sau Nginx hoặc Caddy có HTTPS, chuyển tiếp về cổng 3000.
2. `BASE_URL=https://trithucsoft.vn`, `NODE_ENV=production`, `SESSION_SECRET` dài và ngẫu nhiên.
3. Sao lưu định kỳ: cơ sở dữ liệu (`pg_dump`) và thư mục `uploads`.
4. Khai báo sitemap với Google Search Console.
5. Lập chuyển hướng 301 từ các đường dẫn cũ (ví dụ `/terms-of-service` sang `/dieu-khoan-su-dung`) ở Nginx.

## Cấu trúc mã

```
server.js              Khởi động, bảo mật, phiên đăng nhập
src/schema.sql         Lược đồ cơ sở dữ liệu
src/seed.js            Dữ liệu khởi tạo (nội dung thật từ trithucsoft.vn)
src/settings.js        Danh sách cấu hình động
src/resources.js       Cấu hình các loại nội dung; trang quản trị tự sinh form từ đây
src/routes/public.js   Các trang công khai
src/routes/admin.js    Trang quản trị
views/                 Giao diện (EJS)
public/                CSS, JS, ảnh tĩnh
```
