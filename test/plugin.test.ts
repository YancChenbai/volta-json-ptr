import { createUnplugin } from 'unplugin';
import { describe, it, expect } from 'vitest';

import { unpluginFactory } from '../src/plugins';

describe('plugin transform', () => {
  const plugin = createUnplugin(unpluginFactory).raw({}, { framework: 'vite' }) as {
    transform: (code: string, id: string) => any;
  };

  const transform = plugin.transform;

  it('应该替换代码中的静态 seek 调用', () => {
    const code = `
      import { seek } from 'fast-json-ptr';
      const data = { a: 1 };
      console.log(seek(data, "/a"));
    `;
    const result = transform(code, 'test.ts');

    expect(result.code).toContain('console.log(data?.["a"])');
    expect(result.code).not.toContain('seek(data, "/a")');
    expect(result.map).toBeDefined(); // 确保生成了 sourcemap
  });

  it('不应该匹配非目标函数', () => {
    const code = `otherFunc(data, "/a")`;
    const result = transform(code, 'test.ts');
    expect(result).toBeNull(); // 如果没有变化，通常返回 null
  });

  it('应该处理同一行多个 seek 调用', () => {
    const code = `const val = seek(d, "/a") + seek(d, "/b");`;
    const result = transform(code, 'test.ts');
    expect(result.code).toBe('const val = d?.["a"] + d?.["b"];');
  });

  it('当路径包含安全风险时应跳过优化并警告', () => {
    const code = `seek(data, "/__proto__")`;
    expect(() => transform(code, 'test.ts')).toThrow();
  });
});
