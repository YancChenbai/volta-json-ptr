import { findByPointer } from '@jsonjoy.com/json-pointer';
import { $$find } from '@jsonjoy.com/json-pointer/lib/codegen/index.js';
import { bench } from 'vitest';
import { $seek, seek, peek } from 'volta-json-ptr';

const testData = {
  shallow: { a: 'value', b: 123, c: true },
  deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
  array: { items: [{ id: 1, name: 'Item 1' }] },
};

bench('volta-json-ptr - Runtime', () => {
  const _tmp = $seek(testData, '/deep/a/b/c/d/e');
});

bench('volta-json-ptr - Compiled', () => {
  const _tmp = seek(testData, '/deep/a/b/c/d/e');
});

bench('volta-json-ptr - JIT', () => {
  const _tmp = peek(testData, '/deep/a/b/c/d/e');
});

bench('@jsonjoy.com/json-pointer', () => {
  const _tmp = findByPointer('/deep/a/b/c/d/e', testData);
});

const find = $$find(['deep', 'a', 'b', 'c', 'd', 'e']);

let $find = new Function(`return ${find}`)();

bench('@jsonjoy.com/json-pointer - JIT', () => {
  const _tmp = $find(testData);
});
