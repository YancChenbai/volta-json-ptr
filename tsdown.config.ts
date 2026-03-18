import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      unplugin: './src/plugins/index.ts',
      vite: './src/plugins/vite.ts',
      rollup: './src/plugins/rollup.ts',
      rolldown: './src/plugins/rolldown.ts',
      webpack: './src/plugins/webpack.ts',
      rspack: './src/plugins/rspack.ts',
      esbuild: './src/plugins/esbuild.ts',
      farm: './src/plugins/farm.ts',
      bun: './src/plugins/bun.ts',
      index: './src/runtime.ts',
      macros: './src/macros.ts',
    },
    platform: 'neutral',
    dts: true,
    format: 'esm',
    alias: {
      '#shared': './src/shared/index.ts',
    },
    deps: {
      neverBundle: ['unplugin', 'magic-string', 'vite', 'rolldown'],
    },
  },
]);
