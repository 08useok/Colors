param([switch]$Beta, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
try {
  $projectRoot = Split-Path -Parent $PSScriptRoot
  $runtime = (Get-Command node -ErrorAction Stop).Source
  $readyFile = Join-Path ([IO.Path]::GetTempPath()) ('colors-launch-' + [guid]::NewGuid().ToString('N') + '.json')
  $serverScript = Join-Path $PSScriptRoot 'serve-game.mjs'
  $serverProcess = Start-Process -FilePath $runtime -ArgumentList @(('"' + $serverScript + '"'), ('"' + $readyFile + '"')) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
  for ($attempt = 0; $attempt -lt 100; $attempt++) {
    if (Test-Path -LiteralPath $readyFile) { break }
    if ($serverProcess.HasExited) { throw 'Local server exited before it was ready.' }
    Start-Sleep -Milliseconds 200
  }
  if (!(Test-Path -LiteralPath $readyFile)) { throw 'Local server startup timed out.' }
  $serverInfo = Get-Content -LiteralPath $readyFile -Raw | ConvertFrom-Json
  Remove-Item -LiteralPath $readyFile
  $page = if ($Beta) { '/beta-season.html?test=beta8' } else { '/index.html' }
  $url = $serverInfo.url + $page
  Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 | Out-Null
  Write-Host ('Game URL: ' + $url)
  if (!$NoBrowser) { Start-Process $url }
} catch {
  Write-Host ('Launch failed: ' + $_.Exception.Message)
  Write-Host 'Check that Node.js is installed and available on PATH.'
  if (!$NoBrowser) { Read-Host 'Press Enter to close' | Out-Null }
  exit 1
}
