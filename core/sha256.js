// core/sha256.js
// Offtoco — GPL-3.0-or-later
// Cross-environment SHA-256 (browser SubtleCrypto / Node crypto).
// Fully ESM-clean: no require(), no top-level Node imports so Vite can bundle it.

export async function sha256hex(text) {
  if (typeof text !== 'string') text = String(text ?? '');

  // Browser + Node v19+ — globalThis.crypto.subtle is available in both
  if (typeof globalThis.crypto !== 'undefined'
      && typeof globalThis.crypto.subtle?.digest === 'function') {
    const buf  = new TextEncoder().encode(text);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Node < 19 fallback — dynamic import keeps this file browser-bundle-safe
  const { createHash } = await import('crypto');
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// Note: sha256hexSync() lives in cli/offtoco.js (Batch 3) with a top-level
// Node import. It is intentionally absent here so this file stays importable
// by Vite without any polyfill shim.
