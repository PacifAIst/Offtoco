<div align="center">

```
 ⬡  O F F T O C O
```

### Offline Token Counter

**Count tokens for GPT, Claude and Gemini — plus SHA-256 fingerprint.**
**Everything runs locally. Nothing is ever sent anywhere.**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-black?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20CLI%20%7C%20Windows-black?style=flat-square)]()
[![Zero Knowledge](https://img.shields.io/badge/zero--knowledge-%E2%9C%93-black?style=flat-square)]()
[![No WASM](https://img.shields.io/badge/WASM-free-black?style=flat-square)]()

</div>

---

## What is Offtoco?

Offtoco (**Off**line **To**ken **Co**unter) is a developer tool for counting tokens across the three major LLM families without sending your text to any server, API, or cloud service. Paste a prompt, drop a file, or pipe text through the CLI — you get instant token counts and a SHA-256 fingerprint, fully computed on your machine.

It ships as three independent tools sharing the same pure-JS core:

| Tool | Best for |
|---|---|
| **Web app** | Daily use, drag-and-drop files, dark mode, deployable to GitHub Pages |
| **CLI** | Scripting, CI pipelines, batch processing, terminal workflows |
| **Windows desktop** | Explorer right-click integration, system tray, global hotkey |

---

## Tokenizers

| Model Family | Vocabulary | Implementation | License |
|---|---|---|---|
| **GPT** (o200k_base) | 200,000 tokens | `js-tiktoken` — pure JS, zero WASM | MIT |
| **Claude** (Anthropic BPE) | 64,739 tokens | `@anthropic-ai/tokenizer` vocab + `js-tiktoken` engine | Apache-2.0 |
| **Gemini** | 256,000 tokens | `@lenml/tokenizer-gemini` | Apache-2.0 |

> **Why no WASM?**
> The standard `@anthropic-ai/tokenizer` package ships a WASM binary that Vite and browsers reject with a hard error. Offtoco solves this cleanly: a `postinstall` script extracts the raw BPE vocabulary (`claude.json`) and writes it as a plain ES module (`core/claude-vocab.js`). This is fed into the same pure-JS `js-tiktoken` engine used for GPT, producing **bit-for-bit identical token counts** with zero WASM anywhere in the stack.

---

## Quick Start

### Prerequisites

- **Node.js** >= 20 — [nodejs.org](https://nodejs.org)
- **pnpm** >= 8 — `npm install -g pnpm`

### Install

```bash
git clone https://github.com/PacifAIst/Offtoco.git
cd Offtoco
pnpm install
```

The `postinstall` hook automatically runs `node scripts/gen-claude-vocab.js`, generating `core/claude-vocab.js`. This file is gitignored and rebuilt on every clean install.

### Smoke test

```bash
pnpm run smoke
```

Expected output:
```
Sample : "The quick brown fox jumps over the lazy dog. 1,234,567 tokens!"
GPT    : 18
Claude : 17
Gemini : 22
SHA-256: c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8

OK
```

---

## 1 — Web App

### Dev server

```bash
pnpm web:dev
# Open http://localhost:5173
```

### Production build

```bash
pnpm web:build
# Output: dist/web/index.html — self-contained, open offline in any browser
```

### Deploy to GitHub Pages

```bash
pnpm add -D gh-pages
```

Add to `package.json` scripts:
```json
"deploy": "vite build && gh-pages -d dist/web"
```

```bash
pnpm deploy
# Live at: https://pacifaist.github.io/Offtoco
```

### Features

- Paste or type text — counts update live with a 180ms debounce
- Drag-and-drop any file onto the input area, or use the **Upload file** button
- **Copy** button on each result card with a brief **Copied** confirmation toast
- **Dark / light mode** toggle (top-right corner), preference saved to `localStorage`
- Permanent zero-knowledge disclaimer banner — a reminder that nothing leaves your browser

---

## 2 — CLI

### Usage

```bash
# Text from arguments
node cli/offtoco.js hello world

# Explicit -t flag
node cli/offtoco.js -t "The quick brown fox jumps over the lazy dog"

# Read a file
node cli/offtoco.js -f README.md

# Pipe from stdin
echo "hello world" | node cli/offtoco.js
cat large-document.txt | node cli/offtoco.js

# JSON output for scripting
node cli/offtoco.js --json -f report.txt

# Help
node cli/offtoco.js --help
```

### Output

```
GPT              18  tokens
Claude           17  tokens
Gemini           22  tokens
SHA-256 c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8
```

JSON mode:
```json
{
  "gpt": 18,
  "claude": 17,
  "gemini": 22,
  "sha256": "c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8",
  "chars": 63
}
```

### Build standalone binaries

Binaries are built in two steps: **esbuild** tree-shakes all dependencies into a single file, then **@yao-pkg/pkg** wraps it with a Node 20 runtime. This keeps each binary under ~95 MB instead of the ~235 MB you get from pkg alone.

**Windows (PowerShell, from repo root):**

```powershell
pnpm add -D @yao-pkg/pkg

# Step 1: bundle and tree-shake
npx esbuild cli/offtoco.js --bundle --platform=node --target=node20 --outfile=cli/offtoco.bundle.js --external:electron --format=cjs

# Step 2: package for all platforms
npx pkg cli/offtoco.bundle.js --config cli/pkg.config.json --targets "node20-win-x64,node20-linux-x64,node20-macos-x64" --output "dist/cli/offtoco"
```

Or use the build script:
```powershell
powershell -ExecutionPolicy Bypass -File cli/build.ps1
```

**Linux / macOS:**
```bash
bash cli/build.sh
```

### Binary outputs

| File | Platform | Approx. size |
|---|---|---|
| `dist/cli/offtoco-win.exe` | Windows x64 | ~95 MB |
| `dist/cli/offtoco-linux-x64` | Linux x64 | ~95 MB |
| `dist/cli/offtoco-macos-x64` | macOS Intel | ~95 MB |

> **macOS Apple Silicon:** cross-compiling arm64 from Windows is not supported by pkg. Build natively on a Mac using `bash cli/build.sh`.

> **Binaries exceed GitHub's 100 MB push limit.** Upload them as a GitHub Release via the web interface.

---

## 3 — Windows Desktop App

A frameless Electron popup that integrates with Windows Explorer via registry context menus. No administrator rights required — all entries use `HKCU` (current user).

### Run in development

```powershell
cd 'C:\path\to\Offtoco\desktop'

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Launch with a specific file
.\node_modules\.bin\electron . --file ..\README.md

# Or start silently as a tray app
.\node_modules\.bin\electron .
```

> Always run from inside `desktop\` using the local electron binary. Running `npx electron` from the repo root will download the wrong version.

### Global hotkey

With the tray app running: **Ctrl+Alt+T** reads the clipboard and shows the popup instantly — no file or right-click needed.

### Register Windows Explorer context menus

Run once after setup. Adds two entries:
- Right-click any file in Explorer → **Count Tokens (Offtoco)**
- Right-click the desktop background → **Count Clipboard Text (Offtoco)**

```powershell
# Update these paths to match your machine
$exe  = 'C:\path\to\Offtoco\desktop\node_modules\electron\dist\electron.exe'
$main = 'C:\path\to\Offtoco\desktop\main.js'
$cmd  = "`"$exe`" `"$main`" --file `"%1`""

reg add "HKCU\Software\Classes\*\shell\Offtoco" /ve /d "Count Tokens (Offtoco)" /f
reg add "HKCU\Software\Classes\*\shell\Offtoco\command" /ve /d $cmd /f

New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Value "Count Clipboard Text (Offtoco)" -Force
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco\command" -Value "`"$exe`" `"$main`"" -Force
```

After installing the built `.exe`, replace the paths above with `C:\Program Files\Offtoco\Offtoco.exe` and omit `$main`.

### Remove context menus

```powershell
powershell -ExecutionPolicy Bypass -File desktop\uninstall-registry.ps1
```

### Popup

```
+- [hex] OFFTOCO --------------------------------- [x] -+
|                                                        |
|  GPT     o200k_base         1,234   tok   [ Copy ]    |
|  Claude  Anthropic          1,189   tok   [ Copy ]    |
|  Gemini  256k vocab         1,301   tok   [ Copy ]    |
|  SHA-256 a3f4b2c1...f1a2            [ Copy ]          |
|                                                        |
+- github.com/PacifAIst/Offtoco ----------- [ Close ] --+
```

- Frameless window, always on top, draggable by titlebar
- Copy button on every field with a **checkmark** confirmation
- GitHub link opens in default browser
- Window closes cleanly without ending the tray process

### Build the Windows installer

```powershell
cd 'C:\path\to\Offtoco\desktop'
npm install --legacy-peer-deps

# Bundle with esbuild first — reduces installer from ~160 MB to ~114 MB
npx esbuild main.js --bundle --platform=node --target=node20 --outfile=main.bundle.js --external:electron --format=cjs

# Build NSIS installer
npx electron-builder --win
# Output: desktop\dist\Offtoco Setup 0.1.0.exe  (~114 MB)
```

The NSIS installer lets the user choose the install directory and creates a Start Menu shortcut. No auto-updates, no telemetry, no phone-home of any kind.

> Upload `Offtoco Setup 0.1.0.exe` manually as a GitHub Release asset — it exceeds GitHub's 100 MB push limit.

---

## Repo Structure

```
Offtoco/
|
+-- package.json              pnpm root workspace  (type: module)
+-- vite.config.js            Vite: root=web/, outDir=dist/web/
+-- .gitignore
|
+-- core/                     Shared logic — Node.js and browser
|   +-- tokenizers.js         initTokenizers()  countAll(text) -> {gpt, claude, gemini}
|   +-- sha256.js             sha256hex(text) async — SubtleCrypto / Node crypto
|   +-- format.js             fmt(n) -> "1,234,567"
|   +-- smoke-test.js         pnpm run smoke
|   \-- claude-vocab.js       auto-generated by postinstall  (gitignored)
|
+-- scripts/
|   \-- gen-claude-vocab.js   Reads @anthropic-ai/tokenizer/claude.json -> plain ES module
|
+-- web/                      Browser app  (Vite 5)
|   +-- index.html
|   +-- main.js
|   \-- style.css
|
+-- cli/                      Command-line tool
|   +-- offtoco.js            Entry point (Node ESM)
|   +-- pkg.config.json       Asset manifest for @yao-pkg/pkg
|   +-- build.sh              Linux / macOS binary build
|   \-- build.ps1             Windows binary build
|
\-- desktop/                  Windows Electron app (own node_modules)
    +-- main.js               Main process (CJS + dynamic import for ESM deps)
    +-- preload.js            contextBridge IPC bridge
    +-- popup.html            Popup markup
    +-- popup.css             Popup styles
    +-- popup.js              Popup renderer logic
    +-- package.json          electron-builder config (no installer.nsh)
    +-- install-registry.ps1  Adds HKCU context menus  (no admin needed)
    +-- uninstall-registry.ps1
    \-- build.ps1             esbuild + electron-builder -> NSIS installer
```

---

## Privacy and Security

| Property | Detail |
|---|---|
| No network requests | Zero `fetch`, `XMLHttpRequest` or WebSocket calls in any component |
| No telemetry | No analytics, error reporting, or usage tracking |
| Fully air-gapped | Web app runs from `file://`; CLI and desktop have no network code |
| Vocabularies bundled locally | All three tokenizer vocabularies ship inside their npm packages |
| SHA-256 computed locally | Uses `crypto.subtle` (browser) or Node `crypto` — never transmitted |
| Open source | Full source on GitHub — audit it yourself |

---

## Build Reference

```bash
# Fresh clone and install
git clone https://github.com/PacifAIst/Offtoco.git
cd Offtoco
pnpm install            # also generates core/claude-vocab.js

# Verify core
pnpm run smoke

# Web app
pnpm web:dev            # dev server  -> http://localhost:5173
pnpm web:build          # production  -> dist/web/

# CLI binaries
bash cli/build.sh                                             # Linux / macOS
powershell -ExecutionPolicy Bypass -File cli/build.ps1        # Windows
# -> dist/cli/

# Windows desktop installer  (run from desktop/)
npm install --legacy-peer-deps
npx esbuild main.js --bundle --platform=node --target=node20 --outfile=main.bundle.js --external:electron --format=cjs
npx electron-builder --win
# -> desktop/dist/Offtoco Setup 0.1.0.exe
```

---

## Contributing

1. Fork and clone the repo
2. `pnpm install`
3. Work in `core/`, `web/`, `cli/`, or `desktop/`
4. Run `pnpm run smoke` — all three tokenizers must still match expected counts
5. Open a pull request with a clear description

The two non-negotiable design constraints are **zero-knowledge** (no network calls, ever) and **zero-WASM** (no WASM binaries in the browser bundle).

---

## License

**GPL-3.0-or-later** (c) [PacifAIst](https://github.com/PacifAIst)

Bundled tokenizer vocabularies retain their original upstream licenses:

| Component | License |
|---|---|
| `js-tiktoken` | MIT |
| `@anthropic-ai/tokenizer` vocabulary | Apache-2.0 |
| `@lenml/tokenizer-gemini` | Apache-2.0 |

All three are permissive licenses compatible with downstream GPL-3.0 distribution.
