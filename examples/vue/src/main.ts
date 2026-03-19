import { seek } from 'volta-json-ptr';
import { createApp } from 'vue';

import App from './App.vue';

createApp(App).mount('#app');

const json = {
  foo: {
    bar: {
      baz: 'hello world',
      qux: 123,
      quux: true,
    },
  },
};

const path = '/foo/bar/baz';
const baz = seek(json, '/foo/bar/baz');

console.log(baz);
console.log(seek(json, path));
