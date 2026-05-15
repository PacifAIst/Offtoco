// desktop/main.js — Offtoco desktop app main process
// GPL-3.0-or-later — PacifAIst/Offtoco
'use strict';

const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, Tray, Menu, nativeImage } = require('electron');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');

// ── Resolve core module path (dev vs packaged) ─────────────────
function corePath(file) {
  return app.isPackaged
    ? path.join(process.resourcesPath, file)
    : path.join(__dirname, '../core', file);
}

// ── Tokenizer setup (loaded lazily once) ──────────────────────
const { pathToFileURL } = require('url');
let tokenizersReady = false;
let gptEnc, claudeEnc, geminiTok;

async function loadTokenizers() {
  if (tokenizersReady) return;
  // All tokenizer packages are ESM — must use dynamic import() from CJS
  const { Tiktoken }       = await import('js-tiktoken/lite');
  const o200kMod           = await import('js-tiktoken/ranks/o200k_base');
  const o200k_base         = o200kMod.default ?? o200kMod;
  // claude-vocab.js is a local ESM file — convert path to file:// URL for Windows
  const claudeUrl          = pathToFileURL(corePath('claude-vocab.js')).href;
  const claudeMod          = await import(claudeUrl);
  const claudeJson         = claudeMod.default ?? claudeMod;
  const { fromPreTrained } = await import('@lenml/tokenizer-gemini');
  gptEnc    = new Tiktoken(o200k_base);
  claudeEnc = new Tiktoken(claudeJson);
  geminiTok = fromPreTrained();
  tokenizersReady = true;
}

function countTokens(text) {
  return {
    gpt:    gptEnc.encode(text).length,
    claude: claudeEnc.encode(text, 'all').length,
    gemini: geminiTok.encode(text, { add_special_tokens: false }).length,
    sha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
  };
}

function fmt(n) { return n.toLocaleString('en-US'); }

// ── Popup window ───────────────────────────────────────────────
let popupWin = null;

function showPopup(results) {
  if (popupWin && !popupWin.isDestroyed()) {
    popupWin.webContents.send('results', results);
    popupWin.focus();
    return;
  }

  popupWin = new BrowserWindow({
    width:           380,
    height:          218,
    resizable:       false,
    frame:           false,
    alwaysOnTop:     true,
    skipTaskbar:     true,
    center:          true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  popupWin.loadFile(path.join(__dirname, 'popup.html'));
  popupWin.once('ready-to-show', () => {
    popupWin.show();
    popupWin.webContents.send('results', results);
  });
  popupWin.on('closed', () => { popupWin = null; });
}

async function processText(text) {
  if (!text || !text.trim()) return;
  await loadTokenizers();
  const c = countTokens(text);
  showPopup({
    gpt:    fmt(c.gpt),
    claude: fmt(c.claude),
    gemini: fmt(c.gemini),
    sha256: c.sha256,
  });
}

// ── IPC ────────────────────────────────────────────────────────
ipcMain.on('close-popup', () => { if (popupWin) popupWin.close(); });
ipcMain.handle('copy-to-clipboard', (_e, text) => { clipboard.writeText(text); });
ipcMain.handle('open-external', (_e, url) => {
  require('electron').shell.openExternal(url);
});

// ── Tray ───────────────────────────────────────────────────────
let tray = null;

function setupTray() {
  // 16×16 monochrome icon drawn as PNG data URI
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Offtoco — token counter');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Count clipboard text',
      click: () => processText(clipboard.readText()),
    },
    { type: 'separator' },
    {
      label: 'Quit Offtoco',
      click: () => app.quit(),
    },
  ]));
}

// ── App startup ────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Register global shortcut: Ctrl+Alt+T → count selected/clipboard text
  globalShortcut.register('CommandOrControl+Alt+T', () => {
    processText(clipboard.readText());
  });

  setupTray();

  // Parse launch args
  const args = process.argv.slice(app.isPackaged ? 1 : 2);
  let text = null;

  if (args[0] === '--file' && args[1]) {
    try { text = fs.readFileSync(args[1], 'utf8'); }
    catch (e) { console.error('Cannot read file:', e.message); }
  } else if (args[0] === '--text' && args[1]) {
    text = args.slice(1).join(' ');
  } else if (args.length === 0) {
    // No args and no file: opened from tray/shortcut — do nothing until triggered
    return;
  }

  if (text !== null) await processText(text);
});

app.on('will-quit', () => { globalShortcut.unregisterAll(); });

// Keep app alive when all windows are closed (tray app)
app.on('window-all-closed', (e) => { e.preventDefault(); });
