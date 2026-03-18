import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    testTimeout: 30_000,
    name: 'unit',
    typecheck: {
      enabled: true,
      checker: 'tsc',
    },
  },
  resolve: {
    alias: {
      '#shared': resolve(__dirname, './src/shared/index.ts'),
    },
  },
});
