@echo off
setlocal
set "GAME_ROOT=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$root = $env:GAME_ROOT;" ^
  "$server = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue;" ^
  "if (-not $server) { Start-Process py -ArgumentList '-m','http.server','4173' -WorkingDirectory $root -WindowStyle Hidden };" ^
  "Start-Sleep -Milliseconds 800;" ^
  "Start-Process 'http://localhost:4173/index.html'"

endlocal
