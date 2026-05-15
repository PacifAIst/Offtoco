#!/usr/bin/env node
// cli/offtoco.js — Offtoco command-line interface
// GPL-3.0-or-later — PacifAIst/Offtoco
//
// Usage:
//   offtoco hello world             → text from arguments
//   offtoco -t "hello world"        → text with explicit flag
//   offtoco -f document.txt         → read from file
//   echo "hello" | offtoco          → read from stdin
//   offtoco --json hello world      → JSON output
//   offtoco --help

import { createHash }          from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { initTokenizers, countAll } from '../core/tokenizers.js';

// ── Helpers ────────────────────────────────────────────────────
function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function fmt(n) {
  return n.toLocaleString('en-US');
}

function printHelp() {
  console.log(`
Offtoco — offline token counter  (GPT o200k · Claude · Gemini) + SHA-256
GPL-3.0  https://github.com/PacifAIst/Offtoco

Usage:
  offtoco <text>               count tokens in text (args joined)
  offtoco -t <text>            same, explicit flag
  offtoco -f <file>            count tokens in a file
  echo "text" | offtoco        read from stdin (pipe)
  offtoco --json <text>        output as JSON
  offtoco --help               show this help

Examples:
  offtoco hello world
  offtoco -t "The quick brown fox"
  offtoco -f README.md
  offtoco --json -f report.txt
`.trim());
}

function die(msg) {
  console.error(`offtoco: ${msg}`);
  process.exit(1);
}

// ── Argument parsing ───────────────────────────────────────────
const args = process.argv.slice(2);
let text      = null;
let jsonMode  = false;
let i         = 0;

while (i < args.length) {
  const a = args[i];
  if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
  if (a === '--json')               { jsonMode = true; i++; continue; }
  if (a === '-f') {
    const file = args[++i];
    if (!file)                  die('-f requires a filename');
    if (!existsSync(file))      die(`file not found: ${file}`);
    try { text = readFileSync(file, 'utf8'); }
    catch (e) { die(`cannot read file: ${e.message}`); }
    i++; continue;
  }
  if (a === '-t') {
    // Everything after -t is the text (handles quoted + unquoted)
    text = args.slice(i + 1).join(' ');
    break;
  }
  // No flag — treat remaining args as text
  text = args.slice(i).join(' ');
  break;
}

// ── Stdin fallback ─────────────────────────────────────────────
async function readStdin() {
  if (process.stdin.isTTY) return null;
  return new Promise((resolve) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', c => buf += c);
    process.stdin.on('end', () => resolve(buf));
  });
}

// ── Main ───────────────────────────────────────────────────────
(async () => {
  // If no text was parsed from args, try stdin
  if (text === null || text.trim() === '') {
    const piped = await readStdin();
    if (piped && piped.trim()) {
      text = piped;
    } else {
      printHelp();
      process.exit(0);
    }
  }

  await initTokenizers();

  const c = countAll(text);
  const h = sha256(text);

  if (jsonMode) {
    console.log(JSON.stringify({
      gpt:    c.gpt,
      claude: c.claude,
      gemini: c.gemini,
      sha256: h,
      chars:  text.length,
    }, null, 2));
    return;
  }

  // Human-readable output — aligned columns
  const W = 7; // label width
  console.log(`${'GPT'.padEnd(W)} ${fmt(c.gpt).padStart(12)}  tokens`);
  console.log(`${'Claude'.padEnd(W)} ${fmt(c.claude).padStart(12)}  tokens`);
  console.log(`${'Gemini'.padEnd(W)} ${fmt(c.gemini).padStart(12)}  tokens`);
  console.log(`${'SHA-256'.padEnd(W)} ${h}`);
})();
