<#
.SYNOPSIS
  Sao lưu cơ sở dữ liệu và ảnh tải lên của website Tri Thức.

.DESCRIPTION
  Mỗi lần chạy tạo trong thư mục sao lưu:
    csdl-<ngày giờ>.dump     (pg_dump dạng nén, khôi phục bằng khoi-phuc.ps1)
    uploads-<ngày giờ>.zip   (toàn bộ ảnh, tệp đã tải lên)
  Bản cũ hơn số ngày giữ lại sẽ tự xóa.

.EXAMPLE
  .\sao-luu.ps1                                   # sao lưu ngay
  .\sao-luu.ps1 -DangKyLich                       # tự sao lưu 2 giờ sáng mỗi ngày
  .\sao-luu.ps1 -ThuMucSaoLuu E:\SaoLuu -SoNgayGiu 60 -DangKyLich
#>
[CmdletBinding()]
param(
  [string]$ThuMuc = 'C:\TriThucWeb',
  [string]$ThuMucSaoLuu = 'C:\TriThucWeb-SaoLuu',
  [int]$SoNgayGiu = 30,
  [switch]$DangKyLich,
  [string]$GioChay = '02:00'
)

. (Join-Path $PSScriptRoot 'chung.ps1')

if ($DangKyLich) {
  YeuCauQuyenQuanTri
  $tepScript = Join-Path $ThuMuc 'trien-khai\windows\sao-luu.ps1'
  if (-not (Test-Path $tepScript)) { $tepScript = $PSCommandPath }
  $hanhDong = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$tepScript`" -ThuMuc `"$ThuMuc`" -ThuMucSaoLuu `"$ThuMucSaoLuu`" -SoNgayGiu $SoNgayGiu"
  $lich = New-ScheduledTaskTrigger -Daily -At $GioChay
  $taiKhoan = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
  Register-ScheduledTask -TaskName 'TriThucWeb - Sao luu' -Action $hanhDong -Trigger $lich -Principal $taiKhoan -Force | Out-Null
  Xong "Đã đặt lịch sao lưu lúc $GioChay mỗi ngày vào $ThuMucSaoLuu (giữ $SoNgayGiu ngày)"
  Write-Host '    Nên chép thư mục sao lưu sang ổ hoặc máy khác định kỳ.'
  exit 0
}

$env_ = DocEnv (Join-Path $ThuMuc '.env')
if ($env_['DATABASE_URL'] -notmatch '^postgres(?:ql)?://([^:]+):([^@]+)@([^:/]+):?(\d*)/(.+)$') { Dung 'Không đọc được DATABASE_URL trong .env' }
$nguoiDung, $matKhau, $may, $cong, $csdl = $Matches[1], $Matches[2], $Matches[3], $Matches[4], $Matches[5]
if (-not $cong) { $cong = '5432' }
$pgBin = TimThuMucPostgres
if (-not $pgBin) { Dung 'Không tìm thấy pg_dump.exe (PostgreSQL)' }

New-Item -ItemType Directory -Force -Path $ThuMucSaoLuu | Out-Null
$moc = Get-Date -Format 'yyyyMMdd-HHmmss'

Buoc 'Sao lưu cơ sở dữ liệu'
$tepDump = Join-Path $ThuMucSaoLuu "csdl-$moc.dump"
$env:PGPASSWORD = $matKhau
& (Join-Path $pgBin 'pg_dump.exe') -h $may -p $cong -U $nguoiDung -d $csdl -Fc --no-owner -f $tepDump
$ma = $LASTEXITCODE
Remove-Item Env:PGPASSWORD
if ($ma -ne 0) { Dung "pg_dump thất bại (mã $ma)" }
Xong "$tepDump ($([math]::Round((Get-Item $tepDump).Length / 1KB)) KB)"

Buoc 'Sao lưu ảnh và tệp tải lên'
$uploads = Join-Path $ThuMuc 'uploads'
$tepZip = Join-Path $ThuMucSaoLuu "uploads-$moc.zip"
if ((Get-ChildItem $uploads -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0) {
  Compress-Archive -Path (Join-Path $uploads '*') -DestinationPath $tepZip -Force
  Xong $tepZip
} else { Xong 'Chưa có tệp tải lên' }

Buoc "Xóa bản sao lưu cũ hơn $SoNgayGiu ngày"
$han = (Get-Date).AddDays(-$SoNgayGiu)
$cu = Get-ChildItem $ThuMucSaoLuu -File | Where-Object { $_.Name -match '^(csdl|uploads)-\d{8}-\d{6}\.' -and $_.LastWriteTime -lt $han }
$cu | Remove-Item -Force
Xong "Đã xóa $(($cu | Measure-Object).Count) tệp"

exit 0
