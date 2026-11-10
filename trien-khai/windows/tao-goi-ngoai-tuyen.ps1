<#
.SYNOPSIS
  Tạo gói cài đặt website Tri Thức dùng được trên máy chủ KHÔNG có Internet.

.DESCRIPTION
  Chạy trên một máy Windows có Internet và đã cài Node.js 20 trở lên. Script gom vào một tệp .zip:
    - mã nguồn website kèm thư viện (node_modules) đã cài sẵn
    - bộ cài Node.js 22 LTS, PostgreSQL 16, WinSW (chạy dịch vụ) và Caddy (HTTPS)
  Chép tệp .zip sang máy chủ, giải nén, chạy trien-khai\windows\CAI-DAT.cmd.

.EXAMPLE
  .\tao-goi-ngoai-tuyen.ps1
  .\tao-goi-ngoai-tuyen.ps1 -DauRa D:\TriThucWeb-goi.zip
#>
[CmdletBinding()]
param(
  [string]$DauRa = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'TriThucWeb-goi-cai-dat.zip'),
  [string]$PhienBanPostgres = '16.10-1'
)

. (Join-Path $PSScriptRoot 'chung.ps1')

$nguon = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$node = TimNode
if (-not $node) { Dung 'Máy này cần có Node.js 20 trở lên để cài sẵn thư viện (https://nodejs.org).' }
$npm = Join-Path (Split-Path $node) 'npm.cmd'
$lamViec = Join-Path $env:TEMP ('trithuc-goi-' + (Get-Date -Format 'yyyyMMddHHmmss'))
$goc = Join-Path $lamViec 'TriThucWeb'
$goi = Join-Path $goc 'goi-cai-dat'
New-Item -ItemType Directory -Force -Path $goi | Out-Null

Buoc 'Chép mã nguồn'
& robocopy.exe $nguon $goc /E /XD .git node_modules uploads export logs goi-cai-dat /XF .env /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Dung 'Chép mã nguồn thất bại' }
New-Item -ItemType Directory -Force -Path (Join-Path $goc 'uploads') | Out-Null
Xong $goc

Buoc 'Cài sẵn thư viện'
Push-Location $goc
try { ChayLenh $npm @('ci', '--omit=dev', '--no-audit', '--no-fund') 'npm ci thất bại' } finally { Pop-Location }
Xong 'node_modules đã có trong gói'

Buoc 'Tải bộ cài'
$ds = (Invoke-WebRequest -Uri 'https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt' -UseBasicParsing).Content
$dong = ($ds -split "`n") | Where-Object { $_ -match 'node-v[\d.]+-x64\.msi$' } | Select-Object -First 1
$hash, $tenTep = ($dong.Trim() -split '\s+')
TaiTep "https://nodejs.org/dist/latest-v22.x/$tenTep" (Join-Path $goi $tenTep)
if ((Get-FileHash (Join-Path $goi $tenTep) -Algorithm SHA256).Hash.ToLower() -ne $hash.ToLower()) { Dung 'Bộ cài Node.js sai mã kiểm tra' }
TaiTep "https://get.enterprisedb.com/postgresql/postgresql-$PhienBanPostgres-windows-x64.exe" (Join-Path $goi "postgresql-$PhienBanPostgres-windows-x64.exe")
TaiTep 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe' (Join-Path $goi 'WinSW-x64.exe')
TaiTep 'https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_windows_amd64.zip' (Join-Path $goi 'caddy_2.8.4_windows_amd64.zip')
Xong 'Đã tải đủ bộ cài'

Buoc 'Nén thành một tệp'
if (Test-Path $DauRa) { Remove-Item $DauRa -Force }
Compress-Archive -Path $goc -DestinationPath $DauRa
Remove-Item $lamViec -Recurse -Force
Xong "$DauRa ($([math]::Round((Get-Item $DauRa).Length / 1MB)) MB)"
Write-Host ''
Write-Host 'Chép tệp này sang máy chủ, giải nén, rồi chạy TriThucWeb\trien-khai\windows\CAI-DAT.cmd bằng quyền Administrator.'
