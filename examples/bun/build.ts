import voltaJsonPtr from 'volta-json-ptr/bun';

await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  sourcemap: 'external',
  plugins: [voltaJsonPtr()],
});

export {};
