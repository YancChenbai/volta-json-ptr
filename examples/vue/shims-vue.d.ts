import 'vue';
import { Seek } from 'volta-json-ptr/macros';

declare module 'vue' {
  interface ComponentCustomProperties {
    seek: Seek;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    seek: seek;
  }
}
