# desktop/build.ps1 — builds Offtoco Windows installer via electron-builder
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File desktop\build.ps1

$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

Write-Host "Installing desktop dependencies..."
Set-Location desktop
npm install --legacy-peer-deps

Write-Host "Bundling with esbuild (reduces installer size)..."
npx esbuild main.js --bundle --platform=node --target=node20 --outfile=main.bundle.js --external:electron --external:electron-builder --format=cjs

Write-Host "Building Windows installer..."
# Temporarily point electron-builder at the bundle
$pkg = Get-Content package.json | ConvertFrom-Json
$pkg.main = "main.bundle.js"
$pkg | ConvertTo-Json -Depth 10 | Out-File package.build.json -Encoding ASCII
npx electron-builder --win --config package.build.json

Remove-Item main.bundle.js  -ErrorAction SilentlyContinue
Remove-Item package.build.json -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Installer ready in desktop\dist\"
Get-ChildItem "dist\" -ErrorAction SilentlyContinue | Format-Table Name, Length
Set-Location $repoRoot
