<#
.SYNOPSIS
  Cài website Tri Thức lên Windows Server (không cần Docker).

.DESCRIPTION
  Script làm lần lượt:
    1. Cài Node.js 22 LTS và PostgreSQL 16 nếu máy chưa có
    2. Tạo cơ sở dữ liệu và tài khoản riêng cho website
    3. Chép mã nguồn vào thư mục cài đặt, cài thư viện
    4. Tạo tệp .env với mật khẩu, khóa bí mật ngẫu nhiên
    5. Đăng ký website thành dịch vụ Windows (tự chạy khi khởi động máy, tự bật lại khi lỗi)
    6. Nếu có tên miền: cài Caddy làm cổng HTTPS (tự xin chứng chỉ Let's Encrypt)
    7. Mở tường lửa, kiểm tra website đã chạy

  Chạy lại script nhiều lần vẫn an toàn: dữ liệu, ảnh tải lên và tệp .env đã có được giữ nguyên.

.EXAMPLE
  # Chạy thử trong mạng nội bộ, truy cập http://<máy-chủ>:3000
  .\cai-dat.ps1

.EXAMPLE
  # Chạy chính thức với tên miền và HTTPS
  .\cai-dat.ps1 -TenMien trithucsoft.vn -EmailQuanTri admin@trithucsoft.vn

.EXAMPLE
  # Máy chủ đã có IIS chiếm cổng 80/443: dùng IIS làm cổng vào (xem iis\web.config)
  .\cai-dat.ps1 -TenMien trithucsoft.vn -DungIIS
#>
[CmdletBinding()]
param(
  # Thư mục cài website
  [string]$ThuMuc = 'C:\TriThucWeb',
  # Cổng nội bộ của website
  [int]$Cong = 3000,
  # Tên miền chính thức, ví dụ trithucsoft.vn. Bỏ trống để chạy thử bằng http
  [string]$TenMien = '',
  # Tài khoản quản trị đầu tiên của website
  [string]$EmailQuanTri = 'admin@trithucsoft.vn',
  # Dùng IIS có sẵn làm cổng vào thay vì Caddy
  [switch]$DungIIS,
  # Mật khẩu tài khoản postgres. Bắt buộc khi máy đã cài PostgreSQL từ trước
  [string]$MatKhauPostgres = '',
  # Bộ cài PostgreSQL tải sẵn (.exe của EDB) khi máy không tải được từ mạng
  [string]$BoCaiPostgres = '',
  # Phiên bản bộ cài EDB dùng khi máy không có winget
  [string]$PhienBanPostgres = '16.10-1',
  # Tệp WinSW-x64.exe và gói Caddy .zip tải sẵn, dùng khi máy chủ không ra được GitHub
  [string]$TepWinSW = '',
  [string]$TepCaddyZip = '',
  # Thư mục chứa dữ liệu PostgreSQL (nên đặt ở ổ dữ liệu, ví dụ D:\PostgreSQL\data)
  [string]$ThuMucDuLieuPostgres = '',
  # Máy chủ không có Internet: dùng node_modules có sẵn trong gói (xem mục Cài ngoại tuyến)
  [switch]$NgoaiTuyen,
  # Bộ cài Node.js (.msi) tải sẵn
  [string]$BoCaiNode = ''
)

. (Join-Path $PSScriptRoot 'chung.ps1')
YeuCauQuyenQuanTri

$WINSW_URL = 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe'
$CADDY_URL = 'https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_windows_amd64.zip'
$TEN_CSDL = 'trithuc'
$NGUOI_DUNG_CSDL = 'trithuc'
$coCong = [bool]$TenMien
$dungCaddy = $coCong -and -not $DungIIS
$tam = Join-Path $env:TEMP 'trithuc-cai-dat'
New-Item -ItemType Directory -Force -Path $tam | Out-Null
$nguon = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

# Gói ngoại tuyến (tạo bởi tao-goi-ngoai-tuyen.ps1): tự dùng các bộ cài có sẵn trong thư mục goi-cai-dat
$goi = Join-Path $nguon 'goi-cai-dat'
if (Test-Path $goi) {
  function TimTrongGoi($mau) { $f = Get-ChildItem $goi -File -Filter $mau -ErrorAction SilentlyContinue | Select-Object -First 1; if ($f) { $f.FullName } else { '' } }
  if (-not $BoCaiNode) { $BoCaiNode = TimTrongGoi 'node-v*-x64.msi' }
  if (-not $BoCaiPostgres) { $BoCaiPostgres = TimTrongGoi 'postgresql-*-windows-x64.exe' }
  if (-not $TepWinSW) { $TepWinSW = TimTrongGoi 'WinSW-x64.exe' }
  if (-not $TepCaddyZip) { $TepCaddyZip = TimTrongGoi 'caddy_*_windows_amd64.zip' }
  if (Test-Path (Join-Path $nguon 'node_modules\express')) { $NgoaiTuyen = $true }
  Write-Host "Dùng gói cài đặt có sẵn trong $goi"
}

Write-Host ''
Write-Host 'CÀI ĐẶT WEBSITE TRI THỨC TRÊN WINDOWS SERVER' -ForegroundColor White
Write-Host "Thư mục: $ThuMuc   Cổng nội bộ: $Cong   Tên miền: $(if ($TenMien) { $TenMien } else { '(chưa có, chạy thử bằng http)' })"

# ---------------------------------------------------------------- 1. Node.js
Buoc 'Kiểm tra Node.js'
$node = TimNode
$canCaiNode = $true
if ($node) {
  $pb = (& $node -v).TrimStart('v')
  if ([int]($pb.Split('.')[0]) -ge 20) { $canCaiNode = $false; Xong "Đã có Node.js $pb" }
  else { CanhBao "Node.js $pb quá cũ, sẽ cài bản 22 LTS" }
}
if ($canCaiNode -and $BoCaiNode) {
  $msi = $BoCaiNode
} elseif ($canCaiNode) {
  $ds = (Invoke-WebRequest -Uri 'https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt' -UseBasicParsing).Content
  $dong = ($ds -split "`n") | Where-Object { $_ -match 'node-v[\d.]+-x64\.msi$' } | Select-Object -First 1
  if (-not $dong) { Dung 'Không tìm thấy bộ cài Node.js. Hãy cài Node.js 22 LTS thủ công từ https://nodejs.org rồi chạy lại.' }
  $hash, $tenTep = ($dong.Trim() -split '\s+')
  $msi = Join-Path $tam $tenTep
  TaiTep "https://nodejs.org/dist/latest-v22.x/$tenTep" $msi
  if ((Get-FileHash $msi -Algorithm SHA256).Hash.ToLower() -ne $hash.ToLower()) { Dung 'Bộ cài Node.js tải về bị sai mã kiểm tra, hãy chạy lại.' }
}
if ($canCaiNode) {
  $p = Start-Process msiexec.exe -ArgumentList '/i', "`"$msi`"", '/qn', '/norestart' -Wait -PassThru
  if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010) { Dung "Cài Node.js thất bại (mã $($p.ExitCode))" }
  LamMoiPath
  $node = TimNode
  if (-not $node) { Dung 'Đã cài Node.js nhưng không tìm thấy node.exe' }
  Xong "Đã cài Node.js $(& $node -v)"
}
$npm = Join-Path (Split-Path $node) 'npm.cmd'

# ---------------------------------------------------------------- 2. PostgreSQL
Buoc 'Kiểm tra PostgreSQL'
$pgBin = TimThuMucPostgres
$pgMoiCai = $false
if (-not $pgBin) {
  if (-not $MatKhauPostgres) { $MatKhauPostgres = ChuoiNgauNhien 16 }
  $thamSoEdb = "--mode unattended --unattendedmodeui none --superpassword $MatKhauPostgres --serverport 5432 --enable-components server,commandlinetools --disable-components pgAdmin,stackbuilder"
  if ($ThuMucDuLieuPostgres) { $thamSoEdb += " --datadir `"$ThuMucDuLieuPostgres`"" }
  $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
  if ($BoCaiPostgres) {
    Write-Host "    Cài từ bộ cài có sẵn: $BoCaiPostgres"
    $p = Start-Process $BoCaiPostgres -ArgumentList $thamSoEdb -Wait -PassThru
  } elseif ($winget) {
    Write-Host '    Cài PostgreSQL 16 bằng winget'
    $p = Start-Process $winget.Source -ArgumentList 'install', '-e', '--id', 'PostgreSQL.PostgreSQL.16', '--silent',
      '--accept-package-agreements', '--accept-source-agreements', '--override', "`"$thamSoEdb`"" -Wait -PassThru -NoNewWindow
  } else {
    $exe = Join-Path $tam "postgresql-$PhienBanPostgres-windows-x64.exe"
    try { TaiTep "https://get.enterprisedb.com/postgresql/postgresql-$PhienBanPostgres-windows-x64.exe" $exe }
    catch { Dung "Không tải được PostgreSQL $PhienBanPostgres. Tải bộ cài bản 16 tại https://www.postgresql.org/download/windows/ rồi chạy lại với -BoCaiPostgres <đường dẫn tệp .exe>" }
    $p = Start-Process $exe -ArgumentList $thamSoEdb -Wait -PassThru
  }
  if ($p.ExitCode -ne 0) { Dung "Cài PostgreSQL thất bại (mã $($p.ExitCode))" }
  $pgBin = TimThuMucPostgres
  if (-not $pgBin) { Dung 'Đã chạy bộ cài nhưng không thấy PostgreSQL trong Program Files' }
  $pgMoiCai = $true
  Xong "Đã cài PostgreSQL tại $pgBin"
  Write-Host "    Mật khẩu tài khoản postgres: $MatKhauPostgres  (ghi lại ngay vào nơi an toàn)" -ForegroundColor Yellow
} else {
  Xong "Đã có PostgreSQL tại $pgBin"
}
$psql = Join-Path $pgBin 'psql.exe'
$dvPostgres = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
if ($dvPostgres -and $dvPostgres.Status -ne 'Running') { Start-Service $dvPostgres.Name }

# ---------------------------------------------------------------- 3. Cơ sở dữ liệu
Buoc 'Chuẩn bị cơ sở dữ liệu'
$tepEnv = Join-Path $ThuMuc '.env'
$envCu = DocEnv $tepEnv
$matKhauCsdl = $null
if ($envCu['DATABASE_URL'] -match '^postgres(?:ql)?://[^:]+:([^@]+)@') { $matKhauCsdl = $Matches[1] }
if (-not $matKhauCsdl) { $matKhauCsdl = ChuoiNgauNhien 18 }

if (-not $MatKhauPostgres) {
  $an = Read-Host 'Nhập mật khẩu tài khoản "postgres" của PostgreSQL đã cài trên máy' -AsSecureString
  $MatKhauPostgres = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($an))
}
$env:PGPASSWORD = $MatKhauPostgres
$env:PGCLIENTENCODING = 'UTF8'
$ketNoi = @('-h', '127.0.0.1', '-p', '5432', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-X', '-q')
& $psql @ketNoi -d postgres -tAc 'SELECT 1' | Out-Null
if ($LASTEXITCODE -ne 0) { Dung 'Không đăng nhập được PostgreSQL bằng tài khoản postgres. Kiểm tra lại mật khẩu (-MatKhauPostgres).' }

$sqlVaiTro = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$NGUOI_DUNG_CSDL') THEN CREATE ROLE $NGUOI_DUNG_CSDL LOGIN PASSWORD '$matKhauCsdl'; ELSE ALTER ROLE $NGUOI_DUNG_CSDL LOGIN PASSWORD '$matKhauCsdl'; END IF; END `$`$;"
ChayLenh $psql ($ketNoi + @('-d', 'postgres', '-c', $sqlVaiTro)) 'Không tạo được tài khoản cơ sở dữ liệu'
$daCo = (& $psql @ketNoi -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$TEN_CSDL'")
if (-not ($daCo -match '1')) {
  ChayLenh $psql ($ketNoi + @('-d', 'postgres', '-c', "CREATE DATABASE $TEN_CSDL OWNER $NGUOI_DUNG_CSDL ENCODING 'UTF8' TEMPLATE template0")) 'Không tạo được cơ sở dữ liệu'
  Xong "Đã tạo cơ sở dữ liệu $TEN_CSDL"
} else {
  Xong "Cơ sở dữ liệu $TEN_CSDL đã có, giữ nguyên dữ liệu"
}
Remove-Item Env:PGPASSWORD

# ---------------------------------------------------------------- 4. Mã nguồn
Buoc "Chép mã nguồn vào $ThuMuc"
if (-not (Test-Path (Join-Path $nguon 'server.js'))) { Dung "Không thấy server.js trong $nguon. Hãy chạy script từ trong thư mục mã nguồn." }
if (DichVuTonTai $TenDichVuWeb) { Stop-Service $TenDichVuWeb -Force -ErrorAction SilentlyContinue; Write-Host '    Đã tạm dừng dịch vụ đang chạy' }
New-Item -ItemType Directory -Force -Path $ThuMuc, (Join-Path $ThuMuc 'uploads'), (Join-Path $ThuMuc 'logs'), (Join-Path $ThuMuc 'dichvu') | Out-Null
if ($nguon.TrimEnd('\') -ne (Resolve-Path $ThuMuc).Path.TrimEnd('\')) {
  $boQua = @('.git', 'uploads', 'export', 'logs', 'dichvu', 'caddy', 'goi-cai-dat'); if (-not $NgoaiTuyen) { $boQua += 'node_modules' }
  & robocopy.exe $nguon $ThuMuc /E /R:2 /W:2 /XD @boQua /XF .env /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { Dung "Chép mã nguồn thất bại (robocopy mã $LASTEXITCODE)" }
}
Xong 'Đã chép mã nguồn'

if ($NgoaiTuyen) {
  if (-not (Test-Path (Join-Path $ThuMuc 'node_modules\express'))) { Dung 'Gói ngoại tuyến thiếu thư mục node_modules. Xem mục Cài ngoại tuyến trong HUONG-DAN.md.' }
  Xong 'Dùng thư viện có sẵn trong gói (ngoại tuyến)'
} else {
  Buoc 'Cài thư viện (npm ci)'
  Push-Location $ThuMuc
  try { ChayLenh $npm @('ci', '--omit=dev', '--no-audit', '--no-fund') 'Cài thư viện thất bại. Máy chủ cần ra được registry.npmjs.org, hoặc dùng -NgoaiTuyen' }
  finally { Pop-Location }
  Xong 'Đã cài thư viện'
}

# ---------------------------------------------------------------- 5. Tệp cấu hình .env
Buoc 'Tạo tệp cấu hình .env'
$matKhauQuanTri = $null
if (-not (Test-Path $tepEnv)) {
  $matKhauQuanTri = ChuoiNgauNhien 8
  $baseUrl = if ($coCong) { "https://$TenMien" } else { "http://$($env:COMPUTERNAME.ToLower()):$Cong" }
  $noiDung = @"
# Tạo bởi trien-khai\windows\cai-dat.ps1 ngày $(Get-Date -Format 'dd/MM/yyyy HH:mm')
DATABASE_URL=postgres://${NGUOI_DUNG_CSDL}:$matKhauCsdl@127.0.0.1:5432/$TEN_CSDL
SESSION_SECRET=$(ChuoiNgauNhien 32)
BASE_URL=$baseUrl
PORT=$Cong
HOST=$(if ($coCong) { '127.0.0.1' } else { '' })
NODE_ENV=production
TZ=Asia/Ho_Chi_Minh
ADMIN_EMAIL=$EmailQuanTri
ADMIN_PASSWORD=$matKhauQuanTri
COOKIE_SECURE=$(if ($coCong) { '1' } else { '0' })
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
"@
  GhiTepUtf8 $tepEnv $noiDung
  Xong 'Đã tạo .env'
} else {
  # Giữ cấu hình cũ, chỉ cập nhật mật khẩu cơ sở dữ liệu nếu vừa đổi
  $text = [IO.File]::ReadAllText($tepEnv)
  $text = [regex]::Replace($text, '(?m)^DATABASE_URL=.*$', "DATABASE_URL=postgres://${NGUOI_DUNG_CSDL}:$matKhauCsdl@127.0.0.1:5432/$TEN_CSDL")
  GhiTepUtf8 $tepEnv $text
  Xong 'Giữ nguyên .env đã có'
}
# Chỉ Administrators và SYSTEM đọc được .env (chứa mật khẩu)
& icacls.exe $tepEnv /inheritance:r /grant:r '*S-1-5-32-544:F' '*S-1-5-18:F' | Out-Null

# ---------------------------------------------------------------- 6. Dịch vụ Windows
function CaiDichVu($ten, $xml, $tepExeNguon) {
  $thuMucDv = Join-Path $ThuMuc 'dichvu'
  $exe = Join-Path $thuMucDv "$ten.exe"
  if (-not (Test-Path $exe)) {
    if ($tepExeNguon) { Copy-Item $tepExeNguon $exe }
    else { TaiTep $WINSW_URL $exe }
  }
  if (DichVuTonTai $ten) {
    Stop-Service $ten -Force -ErrorAction SilentlyContinue
    & $exe uninstall | Out-Null
    Start-Sleep -Seconds 2
  }
  GhiTepUtf8 (Join-Path $thuMucDv "$ten.xml") $xml
  & $exe install | Out-Null
  if ($LASTEXITCODE -ne 0) { Dung "Không đăng ký được dịch vụ $ten" }
}
function X($s) { return [Security.SecurityElement]::Escape($s) }

Buoc 'Đăng ký dịch vụ Windows "Website Tri Thức"'
$phuThuoc = if ($dvPostgres) { "<depend>$(X $dvPostgres.Name)</depend>" } else { '' }
$xmlWeb = @"
<service>
  <id>$TenDichVuWeb</id>
  <name>Website Tri Thuc</name>
  <description>Website trithucsoft.vn (Node.js). Cài bởi trien-khai\windows\cai-dat.ps1</description>
  <executable>$(X $node)</executable>
  <arguments>server.js</arguments>
  <workingdirectory>$(X $ThuMuc)</workingdirectory>
  $phuThuoc
  <startmode>Automatic</startmode>
  <delayedAutoStart>true</delayedAutoStart>
  <onfailure action="restart" delay="10 sec"/>
  <onfailure action="restart" delay="30 sec"/>
  <resetfailure>1 hour</resetfailure>
  <stoptimeout>15 sec</stoptimeout>
  <logpath>$(X (Join-Path $ThuMuc 'logs'))</logpath>
  <log mode="roll-by-size"><sizeThreshold>10240</sizeThreshold><keepFiles>8</keepFiles></log>
</service>
"@
CaiDichVu $TenDichVuWeb $xmlWeb $TepWinSW
Start-Service $TenDichVuWeb
Xong 'Dịch vụ TriThucWeb đã chạy'

# ---------------------------------------------------------------- 7. Cổng HTTPS
if ($dungCaddy) {
  Buoc "Cài Caddy làm cổng HTTPS cho $TenMien"
  $thuMucCaddy = Join-Path $ThuMuc 'caddy'
  New-Item -ItemType Directory -Force -Path $thuMucCaddy, (Join-Path $thuMucCaddy 'data') | Out-Null
  $caddyExe = Join-Path $thuMucCaddy 'caddy.exe'
  if (-not (Test-Path $caddyExe)) {
    $zip = if ($TepCaddyZip) { $TepCaddyZip } else { $z = Join-Path $tam 'caddy.zip'; TaiTep $CADDY_URL $z; $z }
    Expand-Archive -Path $zip -DestinationPath (Join-Path $tam 'caddy') -Force
    Copy-Item (Join-Path $tam 'caddy\caddy.exe') $caddyExe -Force
  }
  $mienChinh = $TenMien.ToLower() -replace '^www\.', ''
  $caddyfile = @"
{
	email $EmailQuanTri
}

$mienChinh {
	encode zstd gzip
	reverse_proxy 127.0.0.1:$Cong
	log {
		output file "$((Join-Path $ThuMuc 'logs\truy-cap.log') -replace '\\', '/')" {
			roll_size 20MiB
			roll_keep 10
		}
	}
}

www.$mienChinh {
	redir https://$mienChinh{uri} permanent
}
"@
  GhiTepUtf8 (Join-Path $thuMucCaddy 'Caddyfile') $caddyfile
  # Caddy ghi nhật ký ra stderr; PowerShell 5.1 coi đó là lỗi nếu để ErrorActionPreference = Stop
  $ErrorActionPreference = 'Continue'
  $kq = & $caddyExe validate --config (Join-Path $thuMucCaddy 'Caddyfile') --adapter caddyfile 2>&1
  $maCaddy = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($maCaddy -ne 0) { $kq | ForEach-Object { Write-Host "    $_" }; Dung 'Caddyfile không hợp lệ' }
  $xmlCaddy = @"
<service>
  <id>$TenDichVuCaddy</id>
  <name>Website Tri Thuc - HTTPS (Caddy)</name>
  <description>Cổng HTTPS cho $mienChinh, tự gia hạn chứng chỉ Let's Encrypt</description>
  <executable>$(X $caddyExe)</executable>
  <arguments>run --config Caddyfile --adapter caddyfile</arguments>
  <workingdirectory>$(X $thuMucCaddy)</workingdirectory>
  <env name="XDG_DATA_HOME" value="$(X (Join-Path $thuMucCaddy 'data'))"/>
  <env name="XDG_CONFIG_HOME" value="$(X (Join-Path $thuMucCaddy 'data'))"/>
  <depend>$TenDichVuWeb</depend>
  <startmode>Automatic</startmode>
  <delayedAutoStart>true</delayedAutoStart>
  <onfailure action="restart" delay="10 sec"/>
  <stoptimeout>15 sec</stoptimeout>
  <logpath>$(X (Join-Path $ThuMuc 'logs'))</logpath>
  <log mode="roll-by-size"><sizeThreshold>10240</sizeThreshold><keepFiles>8</keepFiles></log>
</service>
"@
  CaiDichVu $TenDichVuCaddy $xmlCaddy $TepWinSW
  Start-Service $TenDichVuCaddy
  Xong 'Dịch vụ TriThucCaddy đã chạy'
} elseif ($DungIIS) {
  Buoc 'Dùng IIS làm cổng vào'
  CanhBao "Làm tiếp theo mục IIS trong HUONG-DAN.md: cài URL Rewrite + ARR, chép iis\web.config vào thư mục site IIS của $TenMien."
}

# ---------------------------------------------------------------- 8. Tường lửa
Buoc 'Mở tường lửa'
Get-NetFirewallRule -DisplayName 'Website Tri Thuc*' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
if ($dungCaddy) {
  New-NetFirewallRule -DisplayName 'Website Tri Thuc (HTTP/HTTPS)' -Direction Inbound -Protocol TCP -LocalPort 80, 443 -Action Allow | Out-Null
  New-NetFirewallRule -DisplayName 'Website Tri Thuc (HTTP/3)' -Direction Inbound -Protocol UDP -LocalPort 443 -Action Allow | Out-Null
  Xong 'Đã mở cổng 80 và 443'
} elseif (-not $coCong) {
  New-NetFirewallRule -DisplayName "Website Tri Thuc (cổng $Cong)" -Direction Inbound -Protocol TCP -LocalPort $Cong -Action Allow | Out-Null
  Xong "Đã mở cổng $Cong"
} else {
  Xong 'IIS tự quản lý cổng 80/443, cổng Node chỉ nghe nội bộ'
}

# ---------------------------------------------------------------- 9. Kiểm tra
Buoc 'Kiểm tra website'
$ok = $false
for ($i = 0; $i -lt 30 -and -not $ok; $i++) {
  try { $r = Invoke-WebRequest "http://127.0.0.1:$Cong/" -UseBasicParsing -TimeoutSec 5; $ok = $r.StatusCode -eq 200 }
  catch { Start-Sleep -Seconds 2 }
}
if (-not $ok) { Dung "Website chưa trả lời. Xem nhật ký tại $(Join-Path $ThuMuc 'logs')" }
Xong 'Trang chủ trả lời 200'

$envMoi = DocEnv $tepEnv
Write-Host ''
Write-Host '=================== CÀI ĐẶT XONG ===================' -ForegroundColor Green
if ($dungCaddy) {
  Write-Host "Website:     https://$($TenMien -replace '^www\.', '')"
  Write-Host '             (chứng chỉ HTTPS được cấp sau khi tên miền đã trỏ về IP máy chủ này)'
} else {
  Write-Host "Website:     $($envMoi['BASE_URL'])   (trên máy chủ: http://localhost:$Cong)"
}
Write-Host "Quản trị:    $($envMoi['BASE_URL'])/quan-tri"
if ($matKhauQuanTri) {
  Write-Host "Đăng nhập:   $EmailQuanTri / $matKhauQuanTri" -ForegroundColor Yellow
  Write-Host '             Hãy đổi mật khẩu ngay sau lần đăng nhập đầu.' -ForegroundColor Yellow
}
if ($pgMoiCai) {
  Write-Host "PostgreSQL:  tài khoản postgres / $MatKhauPostgres" -ForegroundColor Yellow
  Write-Host '             Ghi lại vào nơi an toàn, cần khi nâng cấp hoặc khôi phục.' -ForegroundColor Yellow
}
Write-Host "Nhật ký:     $(Join-Path $ThuMuc 'logs')"
Write-Host "Sao lưu:     .\sao-luu.ps1 -DangKyLich   (sao lưu tự động 2 giờ sáng mỗi ngày)"
Write-Host '===================================================='
