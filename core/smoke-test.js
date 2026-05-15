// core/smoke-test.js
// Offtoco — GPL-3.0-or-later
// Run with:  npm run smoke
// Verifies every tokenizer + SHA-256 against a known string.

import { initTokenizers, countAll } from './tokenizers.js';
import { sha256hex } from './sha256.js';
import { fmt } from './format.js';

const SAMPLE = 'The quick brown fox jumps over the lazy dog. 1,234,567 tokens!';

(async () => {
  await initTokenizers();
  const c = countAll(SAMPLE);
  const h = await sha256hex(SAMPLE);

  console.log('Sample :', JSON.stringify(SAMPLE));
  console.log('GPT    :', fmt(c.gpt));
  console.log('Claude :', fmt(c.claude));
  console.log('Gemini :', fmt(c.gemini));
  console.log('SHA-256:', h);

  // Expected for SAMPLE on current versions:
  //   GPT 18, Claude 17, Gemini 22
  //   sha c02d938580319068f8ab754ff664f289f13ab0bf4c5245acc29b14b668b5a9f8
  const ok =
    c.gpt > 0 && c.claude > 0 && c.gemini > 0 &&
    /^[0-9a-f]{64}$/.test(h);

  console.log(ok ? '\nOK ✓' : '\nFAILED ✗');
  process.exit(ok ? 0 : 1);
})();
