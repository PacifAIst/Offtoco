// core/format.js
// Offtoco — GPL-3.0-or-later
// Format integers with locale thousands separators: 1234567 → "1,234,567".

export function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US');
}
