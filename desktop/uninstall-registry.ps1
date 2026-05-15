# desktop/uninstall-registry.ps1
# Removes all Offtoco Windows registry context menu entries.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File desktop\uninstall-registry.ps1

Write-Host "Removing Offtoco context menu entries..."

Remove-Item "HKCU:\Software\Classes\*\shell\Offtoco"                    -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Done. Offtoco removed from right-click menus."
