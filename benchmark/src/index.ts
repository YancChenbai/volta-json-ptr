import { Bench } from 'tinybench';
import { $seek, seek, peek } from 'volta-json-ptr';

const bench = new Bench({ name: 'Benchmark', iterations: 10000 });

bench.add('Runtime', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = $seek(testData, '/deep/a/b/c/d/e');
});

bench.add('Compiled', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = seek(testData, '/deep/a/b/c/d/e/');
});

bench.add('JIT', () => {
  const testData = {
    shallow: { a: 'value', b: 123, c: true },
    deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
    array: { items: [{ id: 1, name: 'Item 1' }] },
  };

  const _tmp = peek(testData, '/deep/a/b/c/d/e');
});

for (let i = 0; i < 3; i++) {
  bench.reset();
  console.log(bench.name, 'running...');
  const start = bench.now();
  await bench.run();
  console.log(`${bench.name} took ${bench.now() - start}ms`);
  console.table(bench.table());
}
