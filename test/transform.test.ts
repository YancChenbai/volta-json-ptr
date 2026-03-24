import { parse } from 'oxc-parser';
import { describe, it, expect } from 'vite-plus/test';

import { transformPointerToChain } from '../src/shared';
import { handleSeekMacro, transform, FileType, findMethodImport } from '../src/transform';

describe('Transform Json Pointer to chain', () => {
  it('应该转换基础路径', () => {
    expect(transformPointerToChain('/a/b')).toBe('?.["a"]?.["b"]');
  });

  it('应该正确处理数字索引', () => {
    expect(transformPointerToChain('/h/0')).toBe('?.["h"]?.[0]');
  });

  it('应该处理 RFC 6901 转义', () => {
    expect(transformPointerToChain('/a~1b')).toBe('?.["a/b"]');
    expect(transformPointerToChain('/m~0n')).toBe('?.["m~n"]');
  });

  it('应该处理尾部斜杠（兼容性）', () => {
    expect(transformPointerToChain('/a/')).toBe('?.["a"]');
  });

  it('归一化斜杠', () => {
    expect(transformPointerToChain('a/b')).toBe('?.["a"]?.["b"]');
  });

  it('遇到非法键名应抛出安全错误', () => {
    expect(() => transformPointerToChain('/__proto__')).toThrow('Security Risk');
    expect(() => transformPointerToChain('/constructor')).toThrow('Security Risk');
    expect(() => transformPointerToChain('/prototype')).toThrow('Security Risk');
  });

  it('handle seek macro', async () => {
    const ast1 = await parse('main.js', `const res = seek(obj, '/a/b/c');`);
    const result1 = handleSeekMacro(ast1);
    expect(result1.hasAnyCall).toBe(true);
    expect(result1.hasDynamicPath).toBe(false);
    expect(result1.list).toHaveLength(1);
    expect(result1.list?.[0]?.[2]).toBe('/a/b/c');

    const ast2 = await parse('main.js', `const res = seek(obj, a);`);
    const result2 = handleSeekMacro(ast2);
    expect(result2.hasAnyCall).toBe(true);
    expect(result2.hasDynamicPath).toBe(true);
    expect(result2.list).toHaveLength(0);

    const ast3 = await parse('main.js', `const res = _ctx.seek(obj, '/path');`);
    const result3 = handleSeekMacro(ast3, FileType.VUE);
    expect(result3.hasAnyCall).toBe(true);
    expect(result3.hasDynamicPath).toBe(false);
    expect(result3.list).toHaveLength(1);
    expect(result3.list?.[0]?.[2]).toBe('/path');

    const ast4 = await parse('main.js', `const res = $setup.seek(obj, '/other');`);
    const result4 = handleSeekMacro(ast4, FileType.VUE);
    expect(result4.hasAnyCall).toBe(true);
    expect(result4.hasDynamicPath).toBe(false);
    expect(result4.list).toHaveLength(1);
    expect(result4.list?.[0]?.[2]).toBe('/other');

    const ast5 = await parse('main.js', `console.log('no seek');`);
    const result5 = handleSeekMacro(ast5);
    expect(result5.hasAnyCall).toBe(false);
    expect(result5.hasDynamicPath).toBe(false);
    expect(result5.list).toHaveLength(0);
  });
});

describe('findMethodImport', () => {
  it('应该返回 null 当没有导入时', async () => {
    const ast = await parse('main.js', `console.log('no import');`);
    const result = findMethodImport(ast);
    expect(result).toBeNull();
  });

  it('应该返回 null 当导入不包含 seek 时', async () => {
    const ast = await parse('main.js', `import { other } from 'volta-json-ptr';`);
    const result = findMethodImport(ast);
    expect(result).toBeNull();
  });

  it('应该返回整个导入范围当只有 seek 时', async () => {
    const code = `import { seek } from 'volta-json-ptr';`;
    const ast = await parse('main.js', code);
    const result = findMethodImport(ast);
    expect(result).toEqual([0, code.length]);
  });

  it('应该返回 seek 的部分范围当有多个导入时', async () => {
    const code = `import { a, seek, b } from 'volta-json-ptr';`;
    const ast = await parse('main.js', code);
    const result = findMethodImport(ast);
    expect(result).toEqual([12, 18]);
  });

  it('应该返回 seek 的部分范围当 seek 是第一个时', async () => {
    const code = `import { seek, a } from 'volta-json-ptr';`;
    const ast = await parse('main.js', code);
    const result = findMethodImport(ast);

    expect(result).toEqual([9, 15]);
  });

  it('应该返回 seek 的部分范围当 seek 是最后一个时', async () => {
    const code = `import { a, seek } from 'volta-json-ptr';`;
    const ast = await parse('main.js', code);
    const result = findMethodImport(ast);
    expect(result).toEqual([10, 16]);
  });
});

describe('Transform code', () => {
  it('应该替换代码中的静态 seek 调用', async () => {
    const code = `
      import { seek } from 'fast-json-ptr';
      const data = { a: 1 };
      console.log(seek(data, "/a"));
    `;
    const result = await transform(code, 'test.ts');

    expect(result?.code).toContain('console.log(data?.["a"])');
    expect(result?.code).not.toContain('seek(data, "/a")');
    expect(result?.map).toBeDefined(); // 确保生成了 sourcemap
  });

  it('不应该匹配非目标函数', async () => {
    const code = `otherFunc(data, "/a")`;
    const result = await transform(code, 'test.ts');

    expect(result).toBeNull(); // 如果没有变化，通常返回 null
  });

  it('应该处理同一行多个 seek 调用', async () => {
    const code = `const val = seek(d, "/a") + seek(d, "/b");`;
    const result = await transform(code, 'test.ts');
    expect(result?.code).toBe('const val = d?.["a"] + d?.["b"];');
  });

  it('当路径包含安全风险时应跳过优化并警告', async () => {
    const code = `seek(data, "/__proto__")`;
    await expect(transform(code, 'test.ts')).rejects.toThrow();
  });

  it('应该移除未使用的 seek 导入', async () => {
    const code = `
      import { seek } from 'volta-json-ptr';
      const data = { a: 1 };
      console.log(seek(data, "/a"));
    `;
    const result = await transform(code, 'test.ts');
    expect(result?.code).not.toContain(`import { seek } from 'volta-json-ptr';`);
    expect(result?.code).toContain('console.log(data?.["a"])');
  });

  it('应该添加 seek 导入当有动态路径时', async () => {
    const code = `
      const data = { a: 1 };
      console.log(seek(data, path));
    `;
    const result = await transform(code, 'test.ts');
    expect(result?.code).toContain(`import { seek } from 'volta-json-ptr';`);
    expect(result?.code).toContain('console.log(seek(data, path))');
  });
});
