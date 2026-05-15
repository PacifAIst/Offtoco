// web/main.js — Offtoco web UI logic
// GPL-3.0-or-later — PacifAIst/Offtoco

import { initTokenizers, countAll } from '../core/tokenizers.js';
import { sha256hex }                from '../core/sha256.js';
import { fmt }                      from '../core/format.js';

// ── DOM refs ───────────────────────────────────────────────────
const inputText  = document.getElementById('inputText');
const dropzone   = document.getElementById('dropzone');
const dropOverlay= document.getElementById('dropOverlay');
const fileInput  = document.getElementById('fileInput');
const clearBtn   = document.getElementById('clearBtn');
const metaInfo   = document.getElementById('metaInfo');
const initStatus = document.getElementById('initStatus');
const results    = document.getElementById('results');
const themeBtn   = document.getElementById('themeBtn');

// ── State ──────────────────────────────────────────────────────
let ready = false;
let debounceTimer = null;
const DEBOUNCE_MS = 180;
const MAX_FILE_WARN = 2 * 1024 * 1024; // 2 MB

// ── Init ───────────────────────────────────────────────────────
(async () => {
  try {
    await initTokenizers();
    ready = true;
    initStatus.classList.add('hidden');
    // Count whatever is already in the box (e.g. from browser restore)
    if (inputText.value.trim()) runCount(inputText.value);
  } catch (err) {
    initStatus.textContent = `⚠ Failed to load tokenisers: ${err.message}`;
  }
})();

// ── Core count + render ────────────────────────────────────────
async function runCount(text) {
  if (!ready) return;

  const counts = countAll(text);
  const hash   = await sha256hex(text);

  setVal('val-gpt',    fmt(counts.gpt));
  setVal('val-claude', fmt(counts.claude));
  setVal('val-gemini', fmt(counts.gemini));
  setVal('val-sha',    hash);

  // Update meta info
  const chars = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  metaInfo.textContent = `${fmt(chars)} chars · ${fmt(words)} words`;

  // Reveal cards
  results.classList.add('visible');
}

function clearResults() {
  ['val-gpt', 'val-claude', 'val-gemini', 'val-sha'].forEach(id => setVal(id, '—'));
  results.classList.remove('visible');
  metaInfo.textContent = '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Textarea input (debounced) ─────────────────────────────────
inputText.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const text = inputText.value;
  if (!text) { clearResults(); return; }
  debounceTimer = setTimeout(() => runCount(text), DEBOUNCE_MS);
});

// ── Clear button ───────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  inputText.value = '';
  inputText.focus();
  clearResults();
});

// ── File input ─────────────────────────────────────────────────
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
  // Reset so same file can be re-selected
  fileInput.value = '';
});

// ── Drag and drop ──────────────────────────────────────────────
dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragging');
});
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
});
dropzone.addEventListener('dragleave', (e) => {
  // Only leave when leaving the whole zone (not just child elements)
  if (!dropzone.contains(e.relatedTarget)) {
    dropzone.classList.remove('dragging');
  }
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// ── File handler ───────────────────────────────────────────────
async function handleFile(file) {
  if (file.size > MAX_FILE_WARN) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    metaInfo.textContent = `Reading ${mb} MB — may take a moment…`;
  }
  try {
    const text = await file.text();
    inputText.value = text;
    runCount(text);
  } catch {
    metaInfo.textContent = '⚠ Could not read file as text.';
  }
}

// ── Copy buttons ───────────────────────────────────────────────
results.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  const targetId  = btn.dataset.target;
  const copiedId  = btn.dataset.copied;
  const valEl     = document.getElementById(targetId);
  if (!valEl || valEl.textContent === '—') return;

  try {
    await navigator.clipboard.writeText(valEl.textContent);
  } catch {
    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = valEl.textContent;
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  // Flash "Copied"
  const toast = document.getElementById(copiedId);
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }
});

// ── Theme toggle ───────────────────────────────────────────────
const html = document.documentElement;
const THEME_KEY = 'offtoco-theme';

// Restore saved preference
const saved = localStorage.getItem(THEME_KEY);
if (saved) html.dataset.theme = saved;

themeBtn.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
});
