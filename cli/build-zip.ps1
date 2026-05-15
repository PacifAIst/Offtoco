# cli/build-zip.ps1 — packages Offtoco as portable zips
# After running cli/build.ps1, run this to create download-ready zips.
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File cli\build-zip.ps1

$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

$webSrc  = "dist\web"
$cliSrc  = "dist\cli"
$zipOut  = "dist\zips"

New-Item -ItemType Directory -Force -Path $zipOut | Out-Null

# 1. Web app zip — unzip anywhere, open index.html
if (Test-Path $webSrc) {
    $dest = "$zipOut\offtoco-web.zip"
    Compress-Archive -Path "$webSrc\*" -DestinationPath $dest -Force
    Write-Host "Created: $dest  (open index.html in any browser, fully offline)"
} else {
    Write-Host "Skipping web zip — run pnpm web:build first"
}

# 2. CLI zips — one per platform
$bins = @(
    @{ file="offtoco-win.exe";    zip="offtoco-cli-windows.zip" },
    @{ file="offtoco-linux-x64";  zip="offtoco-cli-linux.zip"   },
    @{ file="offtoco-macos-x64";  zip="offtoco-cli-macos.zip"   }
)

foreach ($b in $bins) {
    $src = "$cliSrc\$($b.file)"
    if (Test-Path $src) {
        $dest = "$zipOut\$($b.zip)"
        Compress-Archive -Path $src -DestinationPath $dest -Force
        Write-Host "Created: $dest"
    }
}

Write-Host ""
Write-Host "All zips in dist\zips\ — ready to upload to GitHub Releases."
Get-ChildItem $zipOut | Format-Table Name, @{N="Size (MB)";E={[math]::Round($_.Length/1MB,1)}}
