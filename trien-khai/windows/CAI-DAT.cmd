@echo off
rem Cai website Tri Thuc. Bam chuot phai, chon "Run as administrator".
rem Co the them tham so, vi du: CAI-DAT.cmd -TenMien trithucsoft.vn
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0cai-dat.ps1" %*
pause
