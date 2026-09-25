@echo off
setlocal
set "BETA_ROOT=%~dp0"

rem 포트가 열려 있어도 응답이 없는 경우가 있어(죽은 서버, IPv6 쪽만 물린 경우)
rem 실제로 한 번 받아 보고 안 되면 127.0.0.1에 새로 띄운다.
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$root = $env:BETA_ROOT;" ^
  "$url = 'http://127.0.0.1:4173';" ^
  "function Test-Server { try { Invoke-WebRequest -Uri ($url + '/beta-season.html') -UseBasicParsing -TimeoutSec 2 | Out-Null; return $true } catch { return $false } };" ^
  "if (-not (Test-Server)) {" ^
  "  Start-Process py -ArgumentList '-m','http.server','4173','--bind','127.0.0.1' -WorkingDirectory $root -WindowStyle Hidden;" ^
  "  foreach ($i in 1..20) { Start-Sleep -Milliseconds 300; if (Test-Server) { break } }" ^
  "};" ^
  "if (Test-Server) { Start-Process ($url + '/beta-season.html?test=beta7') }" ^
  "else { Write-Host '서버를 띄우지 못했습니다. 4173 포트를 쓰는 프로그램을 끄고 다시 실행해 주세요.'; Start-Sleep -Seconds 5 }"

endlocal
