<#
.SYNOPSIS
  Cập nhật website Tri Thức lên mã nguồn mới, giữ nguyên dữ liệu, ảnh và .env.

.DESCRIPTION
  Cách dùng: tải bản mã nguồn mới (git pull hoặc giải nén gói mới) vào một thư mục,
  rồi chạy script trong thư mục đó. Script sẽ sao lưu trước, dừng dịch vụ, chép mã mới,
  cài thư viện, chạy lại và kiểm tra. Nếu website không lên, mã cũ được khôi phục.

.EXAMPLE
  .\cap-nhat.ps1
#>
[CmdletBinding()]
param(
  [string]$ThuMuc = 'C:\TriThucWeb',
  # Bỏ bước sao lưu trước khi cập nhật (không khuyến nghị)
  [switch]$KhongSaoLuu,
  # Máy chủ không có Internet: dùng node_modules có sẵn trong gói thay vì npm ci
  [switch]$NgoaiTuyen
)

. (Join-Path $PSScriptRoot 'chung.ps1')
YeuCauQuyenQuanTri

if (-not (DichVuTonTai $TenDichVuWeb)) { Dung "Chưa có dịch vụ $TenDichVuWeb. Hãy chạy cai-dat.ps1 trước." }
$nguon = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ($nguon.TrimEnd('\') -eq (Resolve-Path $ThuMuc).Path.TrimEnd('\')) {
  Dung 'Hãy chạy script từ thư mục chứa mã nguồn MỚI (không phải thư mục đang cài).'
}
if (Test-Path (Join-Path $nguon 'node_modules\express')) { $NgoaiTuyen = $true }
$node = TimNode
$npm = Join-Path (Split-Path $node) 'npm.cmd'
$cauHinh = DocEnv (Join-Path $ThuMuc '.env')
$cong = if ($cauHinh['PORT']) { $cauHinh['PORT'] } else { '3000' }

if (-not $KhongSaoLuu) {
  Buoc 'Sao lưu trước khi cập nhật'
  & (Join-Path $PSScriptRoot 'sao-luu.ps1') -ThuMuc $ThuMuc
  if ($LASTEXITCODE -ne 0) { Dung 'Sao lưu thất bại nên chưa cập nhật. Chạy lại với -KhongSaoLuu nếu vẫn muốn tiếp tục.' }
}

Buoc 'Giữ lại bản mã hiện tại để khôi phục nếu cần'
$banCu = Join-Path $env:TEMP ("trithuc-ban-cu-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
& robocopy.exe $ThuMuc $banCu /E /XD uploads logs dichvu caddy /NFL /NDL /NJH /NJS /NP | Out-Null
Xong "Đã giữ tại $banCu"

Buoc 'Dừng website và chép mã mới'
Stop-Service $TenDichVuWeb -Force
$boQua = @('.git', 'uploads', 'export', 'logs', 'dichvu', 'caddy', 'goi-cai-dat'); if (-not $NgoaiTuyen) { $boQua += 'node_modules' }
& robocopy.exe $nguon $ThuMuc /E /R:2 /W:2 /XD @boQua /XF .env /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Dung "Chép mã nguồn thất bại (robocopy mã $LASTEXITCODE)" }
if (-not $NgoaiTuyen) {
  Push-Location $ThuMuc
  try { ChayLenh $npm @('ci', '--omit=dev', '--no-audit', '--no-fund') 'Cài thư viện thất bại' } finally { Pop-Location }
}

Buoc 'Chạy lại và kiểm tra'
Start-Service $TenDichVuWeb
$ok = $false
for ($i = 0; $i -lt 30 -and -not $ok; $i++) {
  try { $ok = (Invoke-WebRequest "http://127.0.0.1:$cong/" -UseBasicParsing -TimeoutSec 5).StatusCode -eq 200 } catch { Start-Sleep -Seconds 2 }
}
if ($ok) {
  Xong 'Website đã chạy bản mới'
  Remove-Item $banCu -Recurse -Force -ErrorAction SilentlyContinue
} else {
  CanhBao 'Bản mới không chạy được, đang khôi phục mã cũ'
  Stop-Service $TenDichVuWeb -Force -ErrorAction SilentlyContinue
  & robocopy.exe $banCu $ThuMuc /MIR /XD uploads logs dichvu caddy /XF .env /NFL /NDL /NJH /NJS /NP | Out-Null
  Start-Service $TenDichVuWeb
  Dung "Đã trả về bản cũ. Xem nhật ký trong $(Join-Path $ThuMuc 'logs') để biết lỗi của bản mới."
}
