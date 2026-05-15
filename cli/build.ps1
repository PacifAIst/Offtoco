# cli/build.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot
Write-Host "Building binaries..."
New-Item -ItemType Directory -Force -Path "dist\cli" | Out-Null
npx pkg cli/offtoco.js --config cli/pkg.config.json --targets "node20-win-x64,node20-linux-x64,node20-macos-x64" --output "dist/cli/offtoco"
Write-Host "Done. Binaries in dist\cli\"
Get-ChildItem "dist\cli\" | Format-Table Name, Length
