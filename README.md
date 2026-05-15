<div align="center">

# ⬡ OFFTOCO

**Offline Token Counter**

Count tokens for ChatGPT, Claude and Gemini simultaneously.
Get a SHA-256 fingerprint of your text.
100% offline — your text never leaves your device.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-black?style=flat-square)](LICENSE)
[![Zero Knowledge](https://img.shields.io/badge/zero--knowledge-%E2%9C%93-black?style=flat-square)]()
[![No WASM](https://img.shields.io/badge/WASM-free-black?style=flat-square)]()
[![Platforms](https://img.shields.io/badge/Web%20%7C%20CLI%20%7C%20Windows-black?style=flat-square)]()

</div>

---

## What is a token?

AI models don't read word by word — they break text into fragments called **tokens** (roughly 3–4 characters each). Every model has its own way of splitting text, so the same sentence gives different token counts on GPT, Claude and Gemini. Token counts matter because:

- Models have **context limits** measured in tokens
- API usage is **billed per token**
- Prompt design depends on knowing how many tokens you are using

Offtoco counts all three at once, instantly, with no internet connection required.

---

## Screenshots (run locally or in hosting from low-end ones e.g., Namecheap)

**Web app in any web browser and OS — light mode [[LIVE DEMO ON GITHUB PAGES](https://pacifaist.github.io/Offtoco/)]**

![Offtoco web app light mode](https://github.com/PacifAIst/Offtoco/blob/main/images/1.png)

**Web app in any web browser and OS — dark mode [[LIVE DEMO ON GITHUB PAGES](https://pacifaist.github.io/Offtoco/)]**

![Offtoco web app dark mode](https://github.com/PacifAIst/Offtoco/blob/main/images/2.png)

**CLI output in terminal (Linux / MacOS / Windows console)**

![Offtoco CLI](https://github.com/PacifAIst/Offtoco/blob/main/images/3.png)

**Windows desktop popup after doing a right-click on any file...**

![Offtoco desktop popup](https://github.com/PacifAIst/Offtoco/blob/main/images/4.png)

**... to show the next interface:**

![Offtoco right-click context menu](https://github.com/PacifAIst/Offtoco/blob/main/images/5.png)
---

## Download — no installation, no internet needed after download

All downloads are on the **[Releases page](https://github.com/PacifAIst/Offtoco/releases/latest)**.

---

### Web app — works on any computer or OS

> Unzip once, open in browser, done. No server, no Node.js, no internet.

1. Download **`offtoco-web.zip`**
2. Unzip it — you get a folder called `offtoco-web`
3. Open `offtoco-web/index.html` in any browser (Chrome, Firefox, Edge, Safari)
4. Paste text, drop files, copy counts — everything works offline

To put it on your own server or intranet, copy the `offtoco-web` folder to any static file host — nginx, Apache, Caddy, GitHub Pages, Netlify, a USB stick served by Python. No backend required.

```bash
# Example: serve locally with Python (any OS)
cd offtoco-web
python3 -m http.server 8080
# Open http://localhost:8080
```

```nginx
# Example: nginx on any Linux server
server {
    listen 80;
    server_name tokens.yourdomain.com;
    root /var/www/offtoco-web;
    index index.html;
}
```

---

### Windows desktop app

> Right-click any file in Explorer to count its tokens. No terminal needed.

1. Download **`Offtoco Setup 0.1.0.exe`**
2. Run the installer — pick your install folder, click Install
3. Register the right-click menus (one-time setup, no admin needed):

```powershell
$exe = 'C:\Program Files\Offtoco\Offtoco.exe'
$cmd = "`"$exe`" --file `"%1`""
reg add "HKCU\Software\Classes\*\shell\Offtoco" /ve /d "Count Tokens (Offtoco)" /f
reg add "HKCU\Software\Classes\*\shell\Offtoco\command" /ve /d $cmd /f
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Value "Count Clipboard Text (Offtoco)" -Force
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco\command" -Value "`"$exe`"" -Force
```

Now right-click any file in Explorer and choose **Count Tokens (Offtoco)**.

To remove the right-click menus:
```powershell
Remove-Item "HKCU:\Software\Classes\*\shell\Offtoco" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Recurse -Force -ErrorAction SilentlyContinue
```

**Popup layout:**
```
+- [hex] OFFTOCO --------------------------------- [x] -+
|  GPT     o200k_base         1,234   tok   [ Copy ]    |
|  Claude  Anthropic          1,189   tok   [ Copy ]    |
|  Gemini  256k vocab         1,301   tok   [ Copy ]    |
|  SHA-256 a3f4b2c1...f1a2            [ Copy ]          |
+- github.com/PacifAIst/Offtoco ----------- [ Close ] --+
```

---

### CLI — Windows, Linux, macOS

> Count tokens from the terminal or script it into your workflow.

**Download and extract** the zip for your platform:

| Platform | Download | Extract and rename to |
|---|---|---|
| Windows | `offtoco-cli-windows.zip` | `offtoco.exe` |
| Linux | `offtoco-cli-linux.zip` | `offtoco` |
| macOS Intel | `offtoco-cli-macos.zip` | `offtoco` |

**Linux / macOS — make executable after extracting:**
```bash
chmod +x offtoco
./offtoco hello world
```

**Windows:**
```powershell
.\offtoco.exe hello world
```

**All usage options:**

```bash
offtoco hello world                  # text from arguments
offtoco -t "The quick brown fox"     # explicit text flag
offtoco -f my-document.txt           # read from file
cat file.txt | offtoco               # pipe from stdin
offtoco --json -f file.txt           # JSON output for scripting
offtoco --help                       # show all options
```

**Output:**
```
GPT              18  tokens
Claude           17  tokens
Gemini           22  tokens
SHA-256 c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8
```

**JSON output** (`--json` flag) for use in scripts:
```json
{
  "gpt": 18,
  "claude": 17,
  "gemini": 22,
  "sha256": "c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8",
  "chars": 63
}
```

---

## Tokenizers

| Model | Vocabulary | Package | License |
|---|---|---|---|
| GPT (o200k_base) | 200,000 tokens | `js-tiktoken` | MIT |
| Claude (Anthropic BPE) | 64,739 tokens | `@anthropic-ai/tokenizer` vocab + `js-tiktoken` engine | Apache-2.0 |
| Gemini | 256,000 tokens | `@lenml/tokenizer-gemini` | Apache-2.0 |

> **Zero WASM.** The standard Claude tokenizer package ships a WebAssembly binary that browsers reject. Offtoco extracts the raw vocabulary at install time and uses the same pure-JS engine as GPT — counts are bit-for-bit identical, with no WASM in the browser bundle.

---

## Privacy

| | |
|---|---|
| Network requests | None — ever |
| Telemetry | None |
| Analytics | None |
| Auto-update checks | None |
| Data stored | Nothing — not even locally |
| Verification | Full source code in this repository |

The web app can be opened directly from a USB stick on an air-gapped machine. The CLI binary has no network code. The desktop app has no network code. All tokenizer vocabularies are bundled at install time.

---

## For developers — build from source

### Requirements

- Node.js >= 20 — [nodejs.org](https://nodejs.org)
- pnpm >= 8 — `npm install -g pnpm`

### Install

```bash
git clone https://github.com/PacifAIst/Offtoco.git
cd Offtoco
pnpm install
# postinstall auto-generates core/claude-vocab.js
```

### Verify

```bash
pnpm run smoke
# GPT=18, Claude=17, Gemini=22 — OK
```

### Web app

```bash
pnpm web:dev        # dev server -> http://localhost:5173
pnpm web:build      # production -> dist/web/
```

### Create the web zip (unzip-and-run distribution)

```powershell
New-Item -ItemType Directory -Force -Path dist\zips\offtoco-web | Out-Null
Copy-Item dist\web\* dist\zips\offtoco-web\ -Recurse
Compress-Archive -Path dist\zips\offtoco-web -DestinationPath dist\zips\offtoco-web.zip -Force
Remove-Item dist\zips\offtoco-web -Recurse -Force
```

### CLI binaries (~85-95 MB each, standalone, no Node required)

```powershell
# Windows PowerShell — builds for Win, Linux, macOS
pnpm add -D @yao-pkg/pkg
npx esbuild cli/offtoco.js --bundle --platform=node --target=node20 --outfile=cli/offtoco.bundle.js --external:electron --format=cjs
npx pkg cli/offtoco.bundle.js --config cli/pkg.config.json --targets "node20-win-x64,node20-linux-x64,node20-macos-x64" --output "dist/cli/offtoco"
```

```bash
# Linux / macOS
bash cli/build.sh
```

Create zip for each binary:
```powershell
New-Item -ItemType Directory -Force -Path dist\zips | Out-Null
Compress-Archive -Path dist\cli\offtoco-win.exe -DestinationPath dist\zips\offtoco-cli-windows.zip -Force
Compress-Archive -Path dist\cli\offtoco-linux   -DestinationPath dist\zips\offtoco-cli-linux.zip   -Force
Compress-Archive -Path dist\cli\offtoco-macos   -DestinationPath dist\zips\offtoco-cli-macos.zip   -Force
```

### Windows desktop installer (~114 MB)

```powershell
cd desktop
npm install --legacy-peer-deps
npx esbuild main.js --bundle --platform=node --target=node20 --outfile=main.bundle.js --external:electron --format=cjs
npx electron-builder --win
# Output: desktop\dist\Offtoco Setup 0.1.0.exe
```

### Repo structure

```
Offtoco/
|
+-- package.json              pnpm root (type: module)
+-- vite.config.js
+-- README.md
+-- docs/                     screenshots for this README
|
+-- core/                     shared tokenizer logic — Node and browser
|   +-- tokenizers.js         initTokenizers(), countAll() -> {gpt, claude, gemini}
|   +-- sha256.js             sha256hex() — SubtleCrypto / Node crypto
|   +-- format.js             fmt(1234567) -> "1,234,567"
|   +-- smoke-test.js         pnpm run smoke
|   \-- claude-vocab.js       auto-generated by postinstall, gitignored
|
+-- scripts/
|   \-- gen-claude-vocab.js   extracts claude.json -> plain ES module
|
+-- web/                      browser app (Vite 5)
|   +-- index.html
|   +-- main.js
|   \-- style.css
|
+-- cli/                      command-line tool
|   +-- offtoco.js            entry point
|   +-- pkg.config.json       asset manifest
|   +-- build.sh              Linux / macOS build
|   \-- build.ps1             Windows build
|
\-- desktop/                  Windows Electron app
    +-- main.js               main process
    +-- preload.js            IPC bridge
    +-- popup.html/css/js     popup UI
    +-- package.json          electron-builder config
    +-- install-registry.ps1
    +-- uninstall-registry.ps1
    \-- build.ps1             esbuild + electron-builder
```

---

## Contributing

1. Fork and clone
2. `pnpm install`
3. Edit in `core/`, `web/`, `cli/`, or `desktop/`
4. `pnpm run smoke` must pass
5. Open a pull request

Hard constraints: **zero network calls** and **zero WASM in the browser bundle**.

---

## License

**GPL-3.0-or-later** (c) [PacifAIst](https://github.com/PacifAIst)

Tokenizer vocabularies keep their upstream licenses (MIT and Apache-2.0),
both compatible with GPL-3.0 downstream distribution.

---

<p align="center">Made with ❤️ for the Local AI Community by PacifAIst</p>
