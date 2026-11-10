# Các hàm dùng chung cho bộ script triển khai trên Windows Server.
# Được nạp bởi cai-dat.ps1, cap-nhat.ps1, sao-luu.ps1, go-cai-dat.ps1.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # tải tệp nhanh hơn nhiều trên PowerShell 5.1
# Máy chủ cũ (2016/2019) mặc định chưa bật TLS 1.2 nên tải từ nodejs.org, GitHub sẽ lỗi
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$Script:TenDichVuWeb = 'TriThucWeb'
$Script:TenDichVuCaddy = 'TriThucCaddy'

function Buoc($noiDung) { Write-Host ''; Write-Host "==> $noiDung" -ForegroundColor Cyan }
function Xong($noiDung) { Write-Host "    [OK] $noiDung" -ForegroundColor Green }
function CanhBao($noiDung) { Write-Host "    [!] $noiDung" -ForegroundColor Yellow }
function Dung($noiDung) { Write-Host ''; Write-Host "LỖI: $noiDung" -ForegroundColor Red; exit 1 }

function YeuCauQuyenQuanTri {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $p = New-Object Security.Principal.WindowsPrincipal($id)
  if (-not $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Dung 'Hãy mở PowerShell bằng "Run as Administrator" rồi chạy lại.'
  }
}

function TaiTep($url, $dich) {
  Write-Host "    Tải $url"
  Invoke-WebRequest -Uri $url -OutFile $dich -UseBasicParsing
}

function ChuoiNgauNhien([int]$soByte = 24) {
  $b = New-Object byte[] $soByte
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  # chỉ chữ và số để không vướng ký tự đặc biệt trong chuỗi kết nối
  return (-join ($b | ForEach-Object { '{0:x2}' -f $_ }))
}

function GhiTepUtf8($duongDan, $noiDung) {
  # UTF-8 không BOM: dotenv, Caddy và XML của WinSW đều đọc đúng
  [IO.File]::WriteAllText($duongDan, $noiDung, (New-Object Text.UTF8Encoding($false)))
}

function DocEnv($tep) {
  $kq = @{}
  if (Test-Path $tep) {
    foreach ($dong in [IO.File]::ReadAllLines($tep)) {
      if ($dong -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') { $kq[$Matches[1]] = $Matches[2].Trim() }
    }
  }
  return $kq
}

function TimThuMucPostgres {
  # Ưu tiên bản mới nhất trong Program Files\PostgreSQL\<phiên bản>\bin
  $goc = Join-Path $env:ProgramFiles 'PostgreSQL'
  if (Test-Path $goc) {
    $ds = Get-ChildItem $goc -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'bin\psql.exe') } |
      Sort-Object { [int]($_.Name -replace '[^\d].*$', '') } -Descending
    if ($ds) { return (Join-Path $ds[0].FullName 'bin') }
  }
  $lenh = Get-Command psql.exe -ErrorAction SilentlyContinue
  if ($lenh) { return (Split-Path $lenh.Source) }
  return $null
}

function TimNode {
  $lenh = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($lenh) { return $lenh.Source }
  $p = Join-Path $env:ProgramFiles 'nodejs\node.exe'
  if (Test-Path $p) { return $p }
  return $null
}

function LamMoiPath {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

function DichVuTonTai($ten) { return [bool](Get-Service -Name $ten -ErrorAction SilentlyContinue) }

function ChayLenh($tep, [string[]]$thamSo, $thongBaoLoi) {
  & $tep @thamSo
  if ($LASTEXITCODE -ne 0) { Dung "$thongBaoLoi (mã thoát $LASTEXITCODE)" }
}
