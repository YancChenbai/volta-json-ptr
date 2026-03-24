import { describe, it, expectTypeOf } from 'vite-plus/test';

import { seek } from '../src/runtime';

describe('seek 类型推导测试', () => {
  it('基础对象路径推导', () => {
    const obj = {
      a: 1,
      b: { c: 'hello' },
      d: [true, false],
    };

    // 基础属性
    expectTypeOf(seek(obj, '/a')).toEqualTypeOf<number>();
    // 嵌套属性
    expectTypeOf(seek(obj, '/b/c')).toEqualTypeOf<string>();
    // 数组元素
    expectTypeOf(seek(obj, '/d/0')).toEqualTypeOf<boolean>();
  });

  it('深度推导', () => {
    type Example = [any, string, [number, string, { value: number }], ...any[]];

    const msg = [] as unknown as Example;

    expectTypeOf(seek(msg, '/1')).toEqualTypeOf<string>();
    expectTypeOf(seek(msg, '/2/0')).toEqualTypeOf<number>();
    expectTypeOf(seek(msg, '/2/1')).toEqualTypeOf<string>();
    expectTypeOf(seek(msg, '/2/2/value')).toEqualTypeOf<number>();
  });

  it('RFC 6901 转义路径推导', () => {
    const complex = {
      'a/b': 123,
      'c~d': 'wow',
      'e/f~g': true,
    };

    // ~1 还原为 /
    expectTypeOf(seek(complex, '/a~1b')).toEqualTypeOf<number>();
    // ~0 还原为 ~
    expectTypeOf(seek(complex, '/c~0d')).toEqualTypeOf<string>();
    // 混合转义
    expectTypeOf(seek(complex, '/e~1f~0g')).toEqualTypeOf<boolean>();
  });

  it('空路径与根路径推导', () => {
    const data = { x: 1, '': { '': 1 } };

    expectTypeOf(seek(data, '')).toEqualTypeOf<{ x: number; '': { '': number } }>();
    expectTypeOf(seek(data, '//')).toEqualTypeOf<{ '': number }>();
    expectTypeOf(seek(data, '///')).toEqualTypeOf<number>();
  });

  it('不存在的路径应推导为 undefined', () => {
    const obj = { a: 1 };
    expectTypeOf(seek(obj, '/nonExistent')).toEqualTypeOf<undefined>();
  });
});
