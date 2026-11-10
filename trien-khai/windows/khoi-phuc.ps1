<#
.SYNOPSIS
  Khôi phục website Tri Thức từ bản sao lưu của sao-luu.ps1.

.DESCRIPTION
  Ghi đè TOÀN BỘ dữ liệu hiện tại bằng dữ liệu trong bản sao lưu. Script hỏi xác nhận trước khi làm.

.EXAMPLE
  .\khoi-phuc.ps1 -TepCsdl C:\TriThucWeb-SaoLuu\csdl-20261110-020000.dump -TepUploads C:\TriThucWeb-SaoLuu\uploads-20261110-020000.zip
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$TepCsdl,
  [string]$TepUploads = '',
  [string]$ThuMuc = 'C:\TriThucWeb'
)

. (Join-Path $PSScriptRoot 'chung.ps1')
YeuCauQuyenQuanTri
if (-not (Test-Path $TepCsdl)) { Dung "Không thấy tệp $TepCsdl" }

$env_ = DocEnv (Join-Path $ThuMuc '.env')
if ($env_['DATABASE_URL'] -notmatch '^postgres(?:ql)?://([^:]+):([^@]+)@([^:/]+):?(\d*)/(.+)$') { Dung 'Không đọc được DATABASE_URL trong .env' }
$nguoiDung, $matKhau, $may, $cong, $csdl = $Matches[1], $Matches[2], $Matches[3], $Matches[4], $Matches[5]
if (-not $cong) { $cong = '5432' }
$pgBin = TimThuMucPostgres

$xacNhan = Read-Host "Dữ liệu hiện tại của website sẽ bị thay bằng bản sao lưu. Gõ CO để tiếp tục"
if ($xacNhan -ne 'CO') { Write-Host 'Đã hủy.'; exit 0 }

Buoc 'Dừng website'
Stop-Service $TenDichVuWeb -Force -ErrorAction SilentlyContinue

Buoc 'Khôi phục cơ sở dữ liệu'
$env:PGPASSWORD = $matKhau
& (Join-Path $pgBin 'pg_restore.exe') -h $may -p $cong -U $nguoiDung -d $csdl --clean --if-exists --no-owner --single-transaction $TepCsdl
$ma = $LASTEXITCODE
Remove-Item Env:PGPASSWORD
if ($ma -ne 0) { Start-Service $TenDichVuWeb; Dung "pg_restore thất bại (mã $ma), dữ liệu cũ vẫn giữ nguyên" }
Xong 'Đã khôi phục cơ sở dữ liệu'

if ($TepUploads) {
  Buoc 'Khôi phục ảnh và tệp tải lên'
  $uploads = Join-Path $ThuMuc 'uploads'
  $tam = "$uploads-truoc-khoi-phuc-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  if (Test-Path $uploads) { Rename-Item $uploads $tam }
  New-Item -ItemType Directory -Force -Path $uploads | Out-Null
  Expand-Archive -Path $TepUploads -DestinationPath $uploads -Force
  Xong "Đã khôi phục. Thư mục cũ giữ tại $tam"
}

Buoc 'Chạy lại website'
Start-Service $TenDichVuWeb
Xong 'Xong'
