<script setup lang="ts">
import { $seek, peek } from 'volta-json-ptr';
import { reactive, ref } from 'vue';

const json = {
  foo: {
    bar: {
      baz: 'hello world',
      qux: 123,
      quux: true,
      data: [0],
      '01': [0],
    },
  },
};


const baz = seek(json, '/foo/bar/baz');
const data = seek(json, '/foo/bar/01/0');
const qux = peek(json, '/foo/bar/qux');


const myRef = ref({ f: 1 });
const myRea = reactive({ f: 1 });


console.log($seek(json, '/foo'));
console.log(qux);
</script>

<template>
  <h1>Volta Json Ptr</h1>
  <p>{{ data }}</p>
  <p>{{ seek(myRef, '/f') }}</p>
</template>

<style scoped></style>
