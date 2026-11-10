<#
.SYNOPSIS
  Gỡ dịch vụ website Tri Thức khỏi Windows.

.DESCRIPTION
  Mặc định chỉ gỡ dịch vụ, lịch sao lưu và luật tường lửa; GIỮ NGUYÊN thư mục cài,
  cơ sở dữ liệu, Node.js và PostgreSQL. Thêm -XoaCoSoDuLieu để xóa luôn cơ sở dữ liệu trithuc.
#>
[CmdletBinding()]
param(
  [string]$ThuMuc = 'C:\TriThucWeb',
  [switch]$XoaCoSoDuLieu,
  [string]$MatKhauPostgres = ''
)

. (Join-Path $PSScriptRoot 'chung.ps1')
YeuCauQuyenQuanTri

foreach ($ten in @($TenDichVuCaddy, $TenDichVuWeb)) {
  if (DichVuTonTai $ten) {
    Buoc "Gỡ dịch vụ $ten"
    Stop-Service $ten -Force -ErrorAction SilentlyContinue
    $exe = Join-Path $ThuMuc "dichvu\$ten.exe"
    if (Test-Path $exe) { & $exe uninstall | Out-Null } else { & sc.exe delete $ten | Out-Null }
    Xong 'Đã gỡ'
  }
}
Unregister-ScheduledTask -TaskName 'TriThucWeb - Sao luu' -Confirm:$false -ErrorAction SilentlyContinue
Get-NetFirewallRule -DisplayName 'Website Tri Thuc*' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
Xong 'Đã gỡ lịch sao lưu và luật tường lửa'

if ($XoaCoSoDuLieu) {
  $xacNhan = Read-Host 'Xóa vĩnh viễn cơ sở dữ liệu trithuc? Gõ XOA để tiếp tục'
  if ($xacNhan -eq 'XOA') {
    if (-not $MatKhauPostgres) {
      $an = Read-Host 'Mật khẩu tài khoản postgres' -AsSecureString
      $MatKhauPostgres = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($an))
    }
    $env:PGPASSWORD = $MatKhauPostgres
    $psql = Join-Path (TimThuMucPostgres) 'psql.exe'
    & $psql -h 127.0.0.1 -U postgres -X -q -d postgres -c 'DROP DATABASE IF EXISTS trithuc' -c 'DROP ROLE IF EXISTS trithuc'
    Remove-Item Env:PGPASSWORD
    Xong 'Đã xóa cơ sở dữ liệu'
  }
}
Write-Host ''
Write-Host "Thư mục $ThuMuc vẫn còn (chứa .env và ảnh tải lên). Xóa tay nếu không cần nữa."
