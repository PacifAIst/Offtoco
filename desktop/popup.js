// desktop/popup.js — runs in Electron renderer (no Node access)
'use strict';

// Receive results from main process
window.offtoco.onResults((data) => {
  set('val-gpt',    data.gpt);
  set('val-claude', data.claude);
  set('val-gemini', data.gemini);
  set('val-sha',    data.sha256);
});

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
}

// Copy buttons
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-copy');
  if (!btn) return;
  const val = document.getElementById(btn.dataset.id)?.textContent;
  if (!val || val === '—') return;
  await window.offtoco.copy(val);
  const toast = document.getElementById(btn.dataset.toast);
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
  }
});

// Close buttons
document.getElementById('closeX')  .addEventListener('click', () => window.offtoco.close());
document.getElementById('closeBtn').addEventListener('click', () => window.offtoco.close());

// Repo link
document.getElementById('repoLink').addEventListener('click', (e) => {
  e.preventDefault();
  window.offtoco.openExternal('https://github.com/PacifAIst/Offtoco');
});
