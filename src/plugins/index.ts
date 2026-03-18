import { createUnplugin, type UnpluginFactory } from 'unplugin';

import { transform } from '../transform';

export const unpluginFactory: UnpluginFactory<{} | undefined> = () => {
  return {
    name: 'volta-json-ptr',
    enforce: 'post',
    transformInclude(id) {
      if (id.includes('node_modules')) return false;

      if (id.includes('.vue')) return true;

      const [filepath] = id.split('?');

      if (!filepath) return false;

      return /\.[jt]sx?$/.test(filepath);
    },
    transform(code, id) {
      return transform(code, id);
    },
  };
};

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export const vitePlugin = unplugin.vite;
export const rollupPlugin = unplugin.rollup;
export const rolldownPlugin = unplugin.rolldown;
export const webpackPlugin = unplugin.webpack;
export const rspackPlugin = unplugin.rspack;
export const esbuildPlugin = unplugin.esbuild;
export const farmPlugin = unplugin.farm;
export const bunPlugin = unplugin.bun;

export default unplugin;
