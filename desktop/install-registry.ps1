# desktop/install-registry.ps1
# Adds Offtoco to the Windows right-click context menu for:
#   1. Any file in Explorer  (right-click file → Count Tokens)
#   2. Desktop/folder background (right-click → Count Clipboard Text)
#
# Run ONCE after installing or building the desktop app:
#   powershell -ExecutionPolicy Bypass -File desktop\install-registry.ps1
#
# The script auto-detects whether to use the dev (electron) or
# installed (.exe) path.

param(
  [string]$ExePath = ""
)

# Auto-detect path
if ($ExePath -eq "") {
  $installed   = "C:\Program Files\Offtoco\Offtoco.exe"
  $electronCmd = Get-Command electron -ErrorAction SilentlyContinue
  $devElectron = if ($electronCmd) { $electronCmd.Source } else { $null }
  $repoRoot    = Split-Path $PSScriptRoot -Parent

  if (Test-Path $installed) {
    $ExePath = $installed
  } elseif ($devElectron) {
    $ExePath = "$devElectron $repoRoot\desktop\main.js"
  } else {
    Write-Error "Cannot find Offtoco executable. Pass -ExePath explicitly."
    exit 1
  }
}

Write-Host "Registering Offtoco context menus..."
Write-Host "  Executable: $ExePath"

# 1. Right-click on ANY FILE → Count Tokens
$fileKey = "HKCU:\Software\Classes\*\shell\Offtoco"
New-Item    -Path $fileKey          -Force | Out-Null
Set-ItemProperty $fileKey    "(default)"  "Count Tokens (Offtoco)"
Set-ItemProperty $fileKey    "Icon"       "$ExePath,0" -ErrorAction SilentlyContinue

New-Item    -Path "$fileKey\command" -Force | Out-Null
Set-ItemProperty "$fileKey\command" "(default)" "`"$ExePath`" --file `"%1`""

# 2. Right-click on DESKTOP / FOLDER BACKGROUND → Count Clipboard Text
$bgKey = "HKCU:\Software\Classes\Directory\Background\shell\Offtoco"
New-Item    -Path $bgKey            -Force | Out-Null
Set-ItemProperty $bgKey      "(default)"  "Count Clipboard Text (Offtoco)"

New-Item    -Path "$bgKey\command"  -Force | Out-Null
Set-ItemProperty "$bgKey\command" "(default)" "`"$ExePath`""

Write-Host ""
Write-Host "Done. Right-click any file in Explorer to see Count Tokens (Offtoco)."
Write-Host "Right-click the desktop to see Count Clipboard Text (Offtoco)."
Write-Host ""
Write-Host "To remove:  powershell -ExecutionPolicy Bypass -File desktop\uninstall-registry.ps1"
