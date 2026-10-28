import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/** DEPLOY_BASE=/personal-ai-web/ for GitHub Pages; / for root domains. */
export default defineConfig({
  base: process.env.DEPLOY_BASE ?? '/',
  plugins: [react()],
  build: { outDir: 'dist', rollupOptions: { input: {
    home: resolve(import.meta.dirname, 'index.html'),
    about: resolve(import.meta.dirname, 'about/index.html'),
    needs: resolve(import.meta.dirname, 'needs/index.html'),
    adult: resolve(import.meta.dirname, 'adult/index.html'),
    study: resolve(import.meta.dirname, 'study/index.html'),
  } } },
});
