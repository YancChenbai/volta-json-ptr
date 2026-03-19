import { findByPointer } from '@jsonjoy.com/json-pointer';
import { $$find } from '@jsonjoy.com/json-pointer/lib/codegen/index.js';
import { Bench } from 'tinybench';
import { $seek, seek, peek } from 'volta-json-ptr';

const bench = new Bench({ name: 'Benchmark', iterations: 10000 });

bench.add('volta-json-ptr - Runtime', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = $seek(testData, '/deep/a/b/c/d/e');
});

bench.add('volta-json-ptr - Compiled', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = seek(testData, '/deep/a/b/c/d/e/');
});

bench.add('volta-json-ptr - JIT', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = peek(testData, '/deep/a/b/c/d/e');
});

bench.add('@jsonjoy.com/json-pointer', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };
  const _tmp = findByPointer('/deep/a/b/c/d/e', testData);
});

const find = $$find(['deep', 'a', 'b', 'c', 'd', 'e']);
const $find = eval(find);

bench.add('@jsonjoy.com/json-pointer -JWT', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = $find(testData);
});

console.log(bench.name, 'running...');
const start = bench.now();
await bench.run();
console.log(`${bench.name} took ${bench.now() - start}ms`);
console.table(bench.table());
