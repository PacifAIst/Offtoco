// vite.config.js — Offtoco repo root
// Run from repo root: pnpm web:dev | pnpm web:build
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
  },
  server: {
    // Allow dev server to serve files from outside web/ (i.e. core/)
    fs: { allow: ['..'] },
  },
});
