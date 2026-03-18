import { describe, it, expect } from 'vitest';

import { transformPointerToChain } from '../src/transform';

describe('transformPointerToChain', () => {
  it('应该转换基础路径', () => {
    expect(transformPointerToChain('/a/b', 'obj')).toBe('obj?.["a"]?.["b"]');
  });

  it('应该正确处理数字索引', () => {
    expect(transformPointerToChain('/h/0', 'data')).toBe('data?.["h"]?.[0]');
  });

  it('应该处理 RFC 6901 转义', () => {
    expect(transformPointerToChain('/a~1b', 'obj')).toBe('obj?.["a/b"]');
    expect(transformPointerToChain('/m~0n', 'obj')).toBe('obj?.["m~n"]');
  });

  it('应该处理尾部斜杠（兼容性）', () => {
    expect(transformPointerToChain('/a/', 'obj')).toBe('obj?.["a"]');
  });

  it('遇到非法键名应抛出安全错误', () => {
    expect(() => transformPointerToChain('/__proto__', 'obj')).toThrow('Security Risk');
    expect(() => transformPointerToChain('/constructor', 'obj')).toThrow('Security Risk');
  });
});
