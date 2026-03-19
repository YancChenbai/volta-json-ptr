import { Bench } from 'tinybench';
import { $seek, seek, peek } from 'volta-json-ptr';

const testData = {
  shallow: { a: 'value', b: 123, c: true },
  deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
  array: { items: [{ id: 1, name: 'Item 1' }] },
};

const bench = new Bench({ name: 'Benchmark', time: 300, iterations: 10000 });

bench.add('Runtime', () => {
  const _tmp = $seek(testData, '/deep/a/b/c/d/e');
});

bench.add('Compiled', () => {
  const _tmp = seek(testData, '/deep/a/b/c/d/e/');
});

bench.add('JIT', () => {
  const _tmp = peek(testData, '/deep/a/b/c/d/e');
});

console.log(bench.name, 'running...');

await bench.run();

console.table(bench.table());
