// vite.config.js — Offtoco repo root
// Run from repo root: pnpm web:dev | pnpm web:build
import { defineConfig } from 'vite';
export default defineConfig({
  root: 'web',
  base: '/Offtoco/',
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
  },
  server: {
    fs: { allow: ['..'] },
  },
});