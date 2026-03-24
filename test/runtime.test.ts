import { describe, it, expect } from 'vite-plus/test';

import { seek } from '../src/runtime';

describe('seek core logic', () => {
  const data = {
    a: 1,
    b: {
      c: 2,
      'd/e': 3,
      'f~g': 4,
    },
    h: [10, 20, { i: 30 }],
    '': {
      '': 1,
    },
  };

  it('应该能访问基础属性', () => {
    expect(seek(data, '/a')).toBe(1);
    expect(seek(data, '/b/c')).toBe(2);
  });

  it('应该能访问数组和嵌套数组对象', () => {
    expect(seek(data, '/h/0')).toBe(10);
    expect(seek(data, '/h/2/i')).toBe(30);
  });

  it('应该处理 RFC 6901 转义 (~1 -> /)', () => {
    // 访问键名为 "d/e" 的属性
    expect(seek(data, '/b/d~1e')).toBe(3);
  });

  it('应该处理 RFC 6901 转义 (~0 -> ~)', () => {
    // 访问键名为 "f~g" 的属性
    expect(seek(data, '/b/f~0g')).toBe(4);
  });

  it('应该处理空字符串键名', () => {
    expect(seek(data, '/')).toBe(data);
    expect(seek(data, '')).toBe(data);
    expect(seek(data, '//')).toBe(data['']);
    expect(seek(data, '///')).toBe(1);
  });

  it('路径不存在时应返回 undefined', () => {
    expect(seek(data, '/x/y/z')).toBeUndefined();
    expect(seek(data, '/b/non-exist')).toBeUndefined();

    expect(seek(null, '/a')).toBeUndefined();
  });

  it('应该能处理复杂的复合转义', () => {
    const complex = { 'm~n/o': 99 };
    // ~0 -> ~ , ~1 -> /
    expect(seek(complex, '/m~0n~1o')).toBe(99);
  });
});

describe('安全与边缘情况 (Security & Edge Cases)', () => {
  it('应该拦截原型链相关的非法键名 (Prototype Pollution)', () => {
    const obj = {};
    // 即使路径存在，也应返回 undefined 以保护原型
    expect(() => seek(obj, '/__proto__')).toThrow();
    expect(() => seek(obj, '/constructor')).toThrow();
    expect(() => seek(obj, '/prototype')).toThrow();

    // 测试深层嵌套的拦截
    const deepObj = { a: { b: {} } };
    expect(() => seek(deepObj, '/a/b/__proto__/polluted')).toThrow();
  });

  it('应该拦截还原后的非法键名 (Escape Obfuscation)', () => {
    const obj = {};
    // 即使通过转义绕过，还原后命中黑名单也应拦截
    // ~0 -> ~  => "__proto__"
    expect(seek(obj, '/__p~0roto__')).toBeUndefined();
  });

  it('应该拦截数组的内置方法和属性 (Array Method Leak)', () => {
    const list = [1, 2, 3];
    // 数组也是对象，但 JSON Pointer 只能通过数字索引访问
    expect(seek(list, '/length')).toBeUndefined();
    expect(seek(list, '/push')).toBeUndefined();
    expect(seek(list, '/map')).toBeUndefined();
    expect(seek(list, '/slice')).toBeUndefined();
  });

  it('应该严格校验数组索引 (Strict Indexing)', () => {
    const list = ['a', 'b'];
    // 不允许前导零 (Leading Zeros)
    expect(seek(list, '/01')).toBeUndefined();
    // 不允许负数或小数
    expect(seek(list, '/-1')).toBeUndefined();
    expect(seek(list, '/1.1')).toBeUndefined();
    // "-" 符号在 get 操作中应返回 undefined
    expect(seek(list, '/-')).toBeUndefined();
  });

  it('触碰到原始类型后继续下钻应返回 undefined', () => {
    const obj = { a: 123 };
    // 123 是数字，没有子属性 'b'
    expect(seek(obj, '/a/b')).toBeUndefined();
  });
});
