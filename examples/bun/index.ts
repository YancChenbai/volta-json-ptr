import { peek, seek } from 'volta-json-ptr';

const testData = {
  shallow: { a: 'value', b: 123, c: true },
  deep: { a: { b: { c: { d: { e: 'deep value' } } } } },
  array: { items: [{ id: 1, name: 'Item 1' }] },
};

console.log(peek(testData, '/deep/a/b/c/d/e'));

console.log(seek(testData, '/deep/a/b/c/d/e/'));
