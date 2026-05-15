<div align="center">

# ⬡ Offtoco

**Offline Token Counter**

Count tokens for ChatGPT, Claude and Gemini at the same time.
Get a SHA-256 fingerprint of your text.
Works completely offline — your text never leaves your device.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-black?style=flat-square)](LICENSE)
[![Zero Knowledge](https://img.shields.io/badge/zero--knowledge-%E2%9C%93-black?style=flat-square)]()
[![No WASM](https://img.shields.io/badge/WASM-free-black?style=flat-square)]()
[![Platform](https://img.shields.io/badge/Web%20%7C%20CLI%20%7C%20Windows-black?style=flat-square)]()

</div>

---

## What does it do?

When you write a prompt for an AI model, each model counts words differently — they break text into "tokens". A token is roughly 3–4 characters. Models charge by the token and have token limits, so knowing the count matters.

Offtoco counts tokens for three model families at once, instantly, without sending your text anywhere:

| | GPT (ChatGPT, GPT-4o) | Claude (Anthropic) | Gemini (Google) |
|---|---|---|---|
| Vocabulary size | 200,000 tokens | 64,739 tokens | 256,000 tokens |
| Same text, different count? | Yes — each model tokenises differently |

It also computes a **SHA-256 fingerprint** — a unique hash of your text that lets you verify a document hasn't changed, without revealing its contents.

---

## Screenshots

**Web app — light mode**

![Offtoco web app light mode](docs/screenshot-web-light.png)

**Web app — dark mode**

![Offtoco web app dark mode](docs/screenshot-web-dark.png)

**CLI output**

![Offtoco CLI output](docs/screenshot-cli.png)

**Windows desktop popup**

![Offtoco Windows desktop popup](docs/screenshot-desktop-popup.png)

**Windows right-click context menu**

![Offtoco Windows right-click context menu](docs/screenshot-context-menu.png)

---

## Download and use — no installation required

### Option A: Web app (easiest — works on any device)

1. **[Download offtoco-web.zip](https://github.com/PacifAIst/Offtoco/releases/latest)** from the Releases page
2. Unzip it anywhere on your computer
3. Open `index.html` in your browser
4. Done — paste text, drop files, copy counts

No server needed. No internet needed after download. Works on Windows, macOS, and Linux.

---

### Option B: Windows desktop app

1. **[Download Offtoco Setup 0.1.0.exe](https://github.com/PacifAIst/Offtoco/releases/latest)** from the Releases page
2. Run the installer — choose your install folder
3. Right-click any file in Explorer → **Count Tokens (Offtoco)**
4. Or right-click the desktop → **Count Clipboard Text (Offtoco)**

The popup shows token counts and SHA-256 for the file or clipboard text.

To enable the right-click menus, open PowerShell from the Offtoco install folder and run:

```powershell
# Update the path below to match where you installed Offtoco
$exe = 'C:\Program Files\Offtoco\Offtoco.exe'
$cmd = "`"$exe`" --file `"%1`""
reg add "HKCU\Software\Classes\*\shell\Offtoco" /ve /d "Count Tokens (Offtoco)" /f
reg add "HKCU\Software\Classes\*\shell\Offtoco\command" /ve /d $cmd /f
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Value "Count Clipboard Text (Offtoco)" -Force
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\Offtoco\command" -Value "`"$exe`"" -Force
```

No administrator rights needed — entries go into your user registry only.

To remove the context menus:
```powershell
Remove-Item "HKCU:\Software\Classes\*\shell\Offtoco" -Recurse -Force
Remove-Item "HKCU:\Software\Classes\Directory\Background\shell\Offtoco" -Recurse -Force
```

**Global hotkey:** with the app running in the system tray, press **Ctrl+Alt+T** to count whatever text is in your clipboard.

---

### Option C: CLI — Windows, Linux, macOS

1. **[Download the binary](https://github.com/PacifAIst/Offtoco/releases/latest)** for your platform:
   - `offtoco-cli-windows.zip` → extract `offtoco-win.exe`
   - `offtoco-cli-linux.zip`   → extract `offtoco-linux-x64`
   - `offtoco-cli-macos.zip`   → extract `offtoco-macos-x64`
2. Put it somewhere on your PATH (optional but convenient)
3. Run it:

```bash
# Windows
offtoco-win.exe hello world
offtoco-win.exe -f my-document.txt

# Linux / macOS (make executable first)
chmod +x offtoco-linux-x64
./offtoco-linux-x64 hello world
./offtoco-linux-x64 -f my-document.txt
```

Output:
```
GPT              2  tokens
Claude           2  tokens
Gemini           2  tokens
SHA-256 b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

All flags:

| Flag | What it does |
|---|---|
| `offtoco hello world` | Count tokens in the text that follows |
| `offtoco -t "text here"` | Same, with explicit flag |
| `offtoco -f file.txt` | Count tokens in a file |
| `echo "text" \| offtoco` | Read from stdin (pipe) |
| `offtoco --json -f file.txt` | Output as JSON for scripting |
| `offtoco --help` | Show usage |

---

### Option D: Self-hosted web server

The web app is a static folder — no backend, no database, no runtime.

```bash
# On any Linux server
unzip offtoco-web.zip -d /var/www/offtoco
# Point nginx / Apache / Caddy at /var/www/offtoco
# Done — the app is live at your domain
```

Nginx example:
```nginx
server {
    listen 80;
    server_name tokens.yourdomain.com;
    root /var/www/offtoco;
    index index.html;
}
```

---

## Privacy

Offtoco was designed from the ground up to be zero-knowledge:

- The web app runs entirely in your browser. No requests are made to any server.
- The CLI and desktop app have no network code at all.
- All three tokenizer vocabularies are bundled locally.
- The SHA-256 hash is computed on your device using the operating system's native crypto.
- There is no analytics, no telemetry, no error reporting, and no auto-update check.

You can verify this by inspecting the source code — everything is here in this repository.

---

## For developers — build from source

### Requirements

- Node.js >= 20 — [nodejs.org](https://nodejs.org)
- pnpm >= 8 — `npm install -g pnpm`

### Install and test

```bash
git clone https://github.com/PacifAIst/Offtoco.git
cd Offtoco
pnpm install        # also runs scripts/gen-claude-vocab.js automatically
pnpm run smoke      # should print OK with GPT=18, Claude=17, Gemini=22
```

### Web app

```bash
pnpm web:dev        # dev server at http://localhost:5173
pnpm web:build      # production build -> dist/web/
```

### CLI binaries

```powershell
# Windows — builds ~95 MB standalone executables
pnpm add -D @yao-pkg/pkg
npx esbuild cli/offtoco.js --bundle --platform=node --target=node20 --outfile=cli/offtoco.bundle.js --external:electron --format=cjs
npx pkg cli/offtoco.bundle.js --config cli/pkg.config.json --targets "node20-win-x64,node20-linux-x64,node20-macos-x64" --output "dist/cli/offtoco"
```

```bash
# Linux / macOS
bash cli/build.sh
```

### Create portable zips for distribution

```powershell
# After building the web app and CLI binaries:
powershell -ExecutionPolicy Bypass -File cli\build-zip.ps1
# Creates dist\zips\offtoco-web.zip, offtoco-cli-windows.zip, etc.
```

### Windows desktop installer

```powershell
cd desktop
npm install --legacy-peer-deps
npx esbuild main.js --bundle --platform=node --target=node20 --outfile=main.bundle.js --external:electron --format=cjs
npx electron-builder --win
# Output: desktop\dist\Offtoco Setup 0.1.0.exe  (~114 MB)
```

### Why no WASM?

The standard `@anthropic-ai/tokenizer` package ships a WebAssembly binary. Vite (the web bundler) rejects WASM imports that use the ESM proposal syntax, and adding a plugin just to fix this felt wrong for a tool that prides itself on simplicity.

The solution: a `postinstall` script (`scripts/gen-claude-vocab.js`) reads the raw BPE vocabulary from the package and writes it as a plain JavaScript module (`core/claude-vocab.js`). This file is fed into the same pure-JS `js-tiktoken` engine used for GPT. Token counts are bit-for-bit identical to the official package — no WASM anywhere.

### Repo structure

```
Offtoco/
|
+-- package.json          pnpm root  (type: module)
+-- vite.config.js        Vite config
+-- README.md
|
+-- core/                 Shared tokenizer logic — Node and browser
|   +-- tokenizers.js
|   +-- sha256.js
|   +-- format.js
|   +-- smoke-test.js
|   \-- claude-vocab.js   auto-generated on pnpm install, gitignored
|
+-- scripts/
|   \-- gen-claude-vocab.js
|
+-- web/                  Browser app (Vite 5)
|   +-- index.html
|   +-- main.js
|   \-- style.css
|
+-- cli/                  Command-line tool
|   +-- offtoco.js
|   +-- pkg.config.json
|   +-- build.sh
|   +-- build.ps1
|   \-- build-zip.ps1     creates portable zips for distribution
|
+-- desktop/              Windows Electron app
|   +-- main.js
|   +-- preload.js
|   +-- popup.html / css / js
|   +-- package.json
|   +-- install-registry.ps1
|   +-- uninstall-registry.ps1
|   \-- build.ps1
|
\-- docs/                 Screenshots for this README
    +-- screenshot-web-light.png
    +-- screenshot-web-dark.png
    +-- screenshot-cli.png
    +-- screenshot-desktop-popup.png
    \-- screenshot-context-menu.png
```

---

## Tokenizer details

| Engine | Package | Vocabulary | License |
|---|---|---|---|
| GPT (o200k_base) | `js-tiktoken` | 200,000 tokens | MIT |
| Claude | `@anthropic-ai/tokenizer` vocab + `js-tiktoken` | 64,739 tokens | Apache-2.0 |
| Gemini | `@lenml/tokenizer-gemini` | 256,000 tokens | Apache-2.0 |

---

## Contributing

1. Fork and clone
2. `pnpm install`
3. Make changes in `core/`, `web/`, `cli/`, or `desktop/`
4. `pnpm run smoke` must still pass
5. Open a pull request

The two hard design constraints are **zero-knowledge** (no network calls, ever) and **zero-WASM** (no WebAssembly in the browser bundle).

---

## License

**GPL-3.0-or-later** (c) [PacifAIst](https://github.com/PacifAIst)

Bundled tokenizer vocabularies keep their original upstream licenses (MIT and Apache-2.0), both compatible with GPL-3.0 downstream distribution.
