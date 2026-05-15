#!/usr/bin/env bash
# cli/build.sh — build standalone binaries with @yao-pkg/pkg
# GPL-3.0-or-later — PacifAIst/Offtoco
#
# Usage (from repo root):  bash cli/build.sh
# Output: dist/cli/  containing platform binaries

set -e
cd "$(dirname "$0")/.."   # always run from repo root

echo "► Installing @yao-pkg/pkg (if not present)..."
pnpm add -D @yao-pkg/pkg

echo "► Building binaries..."
mkdir -p dist/cli

# Targets: Node 20 LTS, all three platforms + Apple Silicon
npx pkg cli/offtoco.js \
  --config cli/pkg.config.json \
  --targets node20-linux-x64,node20-macos-x64,node20-macos-arm64,node20-win-x64 \
  --output dist/cli/offtoco

# pkg appends platform suffix automatically:
#   dist/cli/offtoco-linux      → rename for distribution
#   dist/cli/offtoco-macos      → arm64 build named offtoco-macos-arm64
#   dist/cli/offtoco-win.exe

# Rename to cleaner names
[ -f dist/cli/offtoco-linux ]       && mv dist/cli/offtoco-linux     dist/cli/offtoco-linux-x64
[ -f dist/cli/offtoco-macos ]       && mv dist/cli/offtoco-macos     dist/cli/offtoco-macos-x64
[ -f dist/cli/offtoco-macos-arm64 ] && echo "(arm64 already named)"  || true
[ -f dist/cli/offtoco-win.exe ]     && echo "(win binary ready)"     || true

echo ""
echo "✓ Binaries in dist/cli/:"
ls -lh dist/cli/
echo ""
echo "Test (Linux/macOS):"
echo "  ./dist/cli/offtoco-linux-x64 hello world"
echo "  ./dist/cli/offtoco-macos-arm64 -f README.md"
echo ""
echo "Test (Windows, from PowerShell):"
echo "  dist\\cli\\offtoco-win.exe hello world"
