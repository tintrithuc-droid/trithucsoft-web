# Triển khai website Tri Thức trên Windows Server

Bộ script này cài website lên Windows Server **không cần Docker**: Node.js chạy thành dịch vụ Windows, PostgreSQL bản Windows, và (nếu có tên miền) Caddy lo HTTPS tự động. Mọi thành phần đều mã nguồn mở.

| Thành phần | Vai trò | Giấy phép |
|---|---|---|
| Node.js 22 LTS | Chạy website | MIT |
| PostgreSQL 16 | Cơ sở dữ liệu | PostgreSQL License |
| WinSW 2.12 | Biến website thành dịch vụ Windows, tự bật lại khi lỗi | MIT |
| Caddy 2.8 | Cổng HTTPS, tự xin và gia hạn chứng chỉ Let's Encrypt | Apache 2.0 |

## Yêu cầu máy chủ

- Windows Server 2016, 2019, 2022 hoặc 2025 (bản 64-bit). Windows 10/11 cũng chạy được để thử.
- Tối thiểu 2 nhân CPU, 4 GB RAM, 20 GB ổ trống.
- Tài khoản Administrator.
- Có Internet trong lúc cài (tải Node.js, PostgreSQL, thư viện). Máy chủ không có Internet thì xem mục **Cài ngoại tuyến**.
- Nếu dùng tên miền: bản ghi DNS `A` của `trithucsoft.vn` và `www.trithucsoft.vn` trỏ về IP công khai của máy chủ, cổng 80 và 443 mở từ Internet vào.

## Cài đặt

1. Chép thư mục mã nguồn lên máy chủ (git clone, hoặc tải ZIP từ GitHub rồi giải nén), ví dụ vào `C:\Nguon\trithucsoft-web`.
2. Mở **PowerShell bằng Run as Administrator**, rồi:

```powershell
cd C:\Nguon\trithucsoft-web\trien-khai\windows
Set-ExecutionPolicy -Scope Process Bypass -Force
Get-ChildItem -Recurse ..\.. -Include *.ps1 | Unblock-File   # bỏ chặn tệp tải từ Internet
```

3. Chọn một trong ba cách chạy:

**a. Chạy thử trong mạng nội bộ (chưa có tên miền)**

```powershell
.\cai-dat.ps1
```

Website mở ở `http://<tên-máy-chủ>:3000`, trang quản trị ở `/quan-tri`.

**b. Chạy chính thức với tên miền và HTTPS (khuyến nghị)**

```powershell
.\cai-dat.ps1 -TenMien trithucsoft.vn -EmailQuanTri admin@trithucsoft.vn
```

Caddy chiếm cổng 80/443, tự lấy chứng chỉ HTTPS khi tên miền đã trỏ đúng, tự chuyển `www` về tên miền chính. Website Node chỉ nghe nội bộ `127.0.0.1:3000`.

**c. Máy chủ đã có IIS đang chạy các site khác** (xem mục **Dùng IIS**)

```powershell
.\cai-dat.ps1 -TenMien trithucsoft.vn -DungIIS
```

Có thể bấm chuột phải `CAI-DAT.cmd` → Run as administrator thay cho các lệnh trên (tương đương cách a; thêm tham số khi chạy từ cửa sổ lệnh, ví dụ `CAI-DAT.cmd -TenMien trithucsoft.vn`).

Khi xong, màn hình in ra **tài khoản quản trị website** và (nếu vừa cài PostgreSQL) **mật khẩu tài khoản postgres**. Ghi lại cả hai vào nơi an toàn, rồi đăng nhập `/quan-tri` và đổi mật khẩu ngay.

### Tham số hay dùng

| Tham số | Mặc định | Ý nghĩa |
|---|---|---|
| `-ThuMuc` | `C:\TriThucWeb` | Nơi cài website, chứa `.env`, ảnh tải lên, nhật ký |
| `-Cong` | `3000` | Cổng nội bộ của website |
| `-TenMien` | (trống) | Tên miền chính thức. Trống thì chạy http để thử |
| `-EmailQuanTri` | `admin@trithucsoft.vn` | Tài khoản quản trị đầu tiên, cũng là email đăng ký chứng chỉ HTTPS |
| `-DungIIS` | tắt | Dùng IIS có sẵn làm cổng vào thay Caddy |
| `-MatKhauPostgres` | (hỏi khi cần) | Mật khẩu `postgres` khi máy đã có sẵn PostgreSQL |
| `-ThuMucDuLieuPostgres` | theo bộ cài | Đặt dữ liệu PostgreSQL ở ổ khác, ví dụ `D:\PostgreSQL\data` (đường dẫn không có dấu cách) |
| `-BoCaiPostgres`, `-BoCaiNode`, `-TepWinSW`, `-TepCaddyZip` | (tự tải) | Dùng bộ cài tải sẵn |

Chạy lại `cai-dat.ps1` nhiều lần vẫn an toàn: cơ sở dữ liệu, ảnh tải lên và tệp `.env` đã có được giữ nguyên.

## Sau khi cài

| Việc | Ở đâu |
|---|---|
| Cấu hình (SMTP gửi email, địa chỉ website...) | `C:\TriThucWeb\.env`, sửa xong chạy `Restart-Service TriThucWeb` |
| Nhật ký website | `C:\TriThucWeb\logs\TriThucWeb.out.log`, `TriThucWeb.err.log` |
| Nhật ký truy cập HTTPS | `C:\TriThucWeb\logs\truy-cap.log` |
| Dừng, chạy, khởi động lại | `services.msc` → **Website Tri Thuc**, hoặc `Restart-Service TriThucWeb` |

Hai dịch vụ tự chạy khi máy chủ khởi động và tự bật lại nếu bị lỗi.

### Sao lưu tự động

```powershell
.\sao-luu.ps1 -DangKyLich                                # 2 giờ sáng mỗi ngày, giữ 30 ngày
.\sao-luu.ps1 -ThuMucSaoLuu E:\SaoLuu -SoNgayGiu 60 -DangKyLich
.\sao-luu.ps1                                            # sao lưu ngay
```

Mỗi lần tạo `csdl-<ngày>.dump` (cơ sở dữ liệu) và `uploads-<ngày>.zip` (ảnh, tệp). Nên chép thư mục sao lưu sang ổ hoặc máy khác định kỳ.

Khôi phục:

```powershell
.\khoi-phuc.ps1 -TepCsdl C:\TriThucWeb-SaoLuu\csdl-20261110-020000.dump -TepUploads C:\TriThucWeb-SaoLuu\uploads-20261110-020000.zip
```

### Cập nhật phiên bản mới

Lấy mã nguồn mới về một thư mục (`git pull`, hoặc giải nén gói mới), rồi chạy script **trong thư mục mới đó**:

```powershell
cd C:\Nguon\trithucsoft-web\trien-khai\windows
.\cap-nhat.ps1
```

Script tự sao lưu, dừng dịch vụ, chép mã mới, cài thư viện, chạy lại và kiểm tra. Nếu bản mới không chạy, mã cũ được trả lại tự động.

### Gỡ cài đặt

```powershell
.\go-cai-dat.ps1                     # gỡ dịch vụ, lịch sao lưu, tường lửa; giữ dữ liệu
.\go-cai-dat.ps1 -XoaCoSoDuLieu      # xóa luôn cơ sở dữ liệu (hỏi xác nhận)
```

## Cài ngoại tuyến (máy chủ không có Internet)

Trên một máy Windows **có Internet** và đã cài Node.js:

```powershell
cd <mã nguồn>\trien-khai\windows
.\tao-goi-ngoai-tuyen.ps1           # tạo TriThucWeb-goi-cai-dat.zip trên Desktop (khoảng 400 MB)
```

Chép tệp ZIP sang máy chủ, giải nén, chạy `TriThucWeb\trien-khai\windows\cai-dat.ps1` như mục Cài đặt. Script tự nhận ra các bộ cài trong thư mục `goi-cai-dat` và không cần mạng. (Với tên miền HTTPS, máy chủ vẫn cần ra Internet để xin chứng chỉ Let's Encrypt.)

## Dùng IIS

Khi máy chủ đã chạy IIS cho các site khác, cổng 80/443 do IIS giữ nên không dùng Caddy được.

1. Cài 2 mô-đun miễn phí của Microsoft: **URL Rewrite** và **Application Request Routing (ARR)**.
2. IIS Manager → chọn tên máy chủ → **Application Request Routing Cache** → **Server Proxy Settings** → tích **Enable proxy** → Apply.
3. Tạo site mới (ví dụ thư mục `C:\inetpub\trithucsoft`), binding `https` cho `trithucsoft.vn` và `www.trithucsoft.vn` với chứng chỉ SSL (có thể lấy miễn phí bằng win-acme), thêm binding `http` để chuyển hướng.
4. Chép `trien-khai\windows\iis\web.config` vào thư mục site.
5. Chạy `.\cai-dat.ps1 -TenMien trithucsoft.vn -DungIIS`.

## Xử lý sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| `running scripts is disabled on this system` | Chạy `Set-ExecutionPolicy -Scope Process Bypass -Force` trong cửa sổ đó |
| Không đăng nhập được `/quan-tri` khi chạy http | Kiểm tra `COOKIE_SECURE=0` trong `.env` (cách a đặt sẵn), rồi `Restart-Service TriThucWeb` |
| Website không lên sau khi cài | Xem `C:\TriThucWeb\logs\TriThucWeb.err.log`. Hay gặp nhất: PostgreSQL chưa chạy (`Get-Service postgresql*`) |
| HTTPS chưa có chứng chỉ | Kiểm tra DNS đã trỏ về đúng IP, cổng 80/443 mở từ ngoài vào (cả tường lửa của nhà mạng/cloud). Xem `C:\TriThucWeb\logs\TriThucCaddy.err.log` |
| Cổng 80/443 đã bị chiếm | Có IIS hoặc phần mềm khác đang dùng. Dùng cách c (IIS), hoặc dừng site Default Web Site |
| Quên mật khẩu quản trị website | Đăng nhập bằng tài khoản quản trị khác để đặt lại, hoặc nhờ hỗ trợ đặt lại trong cơ sở dữ liệu |

## Chuyển hướng từ website cũ

Website cũ có các đường dẫn tiếng Anh (ví dụ `/terms-of-service`). Để giữ thứ hạng tìm kiếm, thêm chuyển hướng 301 vào `C:\TriThucWeb\caddy\Caddyfile` trong khối `trithucsoft.vn { ... }`:

```
redir /terms-of-service /dieu-khoan-su-dung permanent
```

Sau đó `Restart-Service TriThucCaddy`.
