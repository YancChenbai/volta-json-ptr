import { GetByPointer, JsonValue } from '../shared';

type Seek = <T extends JsonValue, P extends string>(obj: T, path: P) => GetByPointer<T, P>;

declare global {
  const seek: Seek;
}

export type { Seek };
