@echo off
setlocal
set "BETA_ROOT=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$root = $env:BETA_ROOT;" ^
  "$server = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue;" ^
  "if (-not $server) { Start-Process py -ArgumentList '-m','http.server','4173' -WorkingDirectory $root -WindowStyle Hidden };" ^
  "Start-Sleep -Milliseconds 800;" ^
  "Start-Process 'http://localhost:4173/beta-season.html'"

endlocal
