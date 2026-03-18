<script setup lang="ts">
import { peek } from 'volta-json-ptr';

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
</script>

<template>
  <h1>Volta Json Ptr</h1>
  <p>{{ baz }}</p>
  <p>{{ data }}</p>
  <p>{{ seek(json, '/foo/bar') }}</p>
  <p>{{ qux }}</p>
</template>

<style scoped></style>
