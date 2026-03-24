import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';
import vueDevTools from 'vite-plugin-vue-devtools';
import fastJsonPtr from 'volta-json-ptr/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), fastJsonPtr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // '#shared': fileURLToPath(new URL('../../src/shared/index.ts', import.meta.url)),
    },
    // conditions: ['dev'],
  },
  build: {
    minify: false,
  },
});
