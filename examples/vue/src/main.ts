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

const baz = seek(json as {}, '/foo/bar/baz');

console.log(baz);
