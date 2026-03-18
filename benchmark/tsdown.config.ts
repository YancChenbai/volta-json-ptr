import { defineConfig } from 'tsdown';
import fastJsonPtr from 'volta-json-ptr/rolldown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  platform: 'node',
  format: 'esm',
  plugins: [fastJsonPtr()],
  deps: {
    neverBundle: ['tinybench'],
  },
});
