import { RE_STRICT_UINT, INVALID_KEYS, transformPointerToChain, decodePointerKey } from '#shared';
import type { GetByPointer, JsonValue } from '#shared';

export function seek<T extends any, P extends string>(obj: T, path: P): GetByPointer<T, P>;

export function seek(obj: any, path: string) {
  // 根路径处理："" 或 "/" 指向原对象
  if (path === '' || path === '/') return obj;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 路径切分
  const segments = normalizedPath.split('/').slice(1);

  // 如果以斜杠结尾（如 "/a/"）, 去掉末尾产生的空片段
  if (segments.length > 1 && segments[segments.length - 1] === '') {
    segments.pop();
  }

  let result: any = obj;

  for (const rawKey of segments) {
    // 如果当前层级无法继续深入 (null 或非对象), 直接返回 undefined
    if (result == null || typeof result !== 'object') {
      return undefined;
    }

    // 将 ~1 还原为 /, 将 ~0 还原为 ~
    const key = decodePointerKey(rawKey);

    if (INVALID_KEYS.has(key)) {
      throw new Error(
        `[volta-json-ptr] Security Risk: Forbidden key "${key}" found in static path "${path}"`,
      );
    }

    if (Array.isArray(result)) {
      if (!RE_STRICT_UINT.test(key)) return undefined;

      result = result[Number(key)];
    } else {
      result = result[key];
    }
  }

  return result;
}

type Getter = (obj: any) => any;

class LRU<K, V> {
  private cache = new Map<K, V>();
  constructor(private readonly max: number = 1000) {}

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      const result = this.cache.keys().next();
      if (!result.done) {
        this.cache.delete(result.value);
      }
    }
    this.cache.set(key, value);
  }
}

const JIT_CACHE = new LRU<string, Getter>(500);

export function peek<T extends any, P extends string>(obj: T, path: P): GetByPointer<T, P>;
export function peek(obj: any, path: string) {
  let fn = JIT_CACHE.get(path);

  if (!fn) {
    const body = `return (obj) => obj${transformPointerToChain(path)}`;

    try {
      fn = new Function(body)() as Getter;
      JIT_CACHE.set(path, fn);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  return fn(obj);
}

export const $seek = seek;

export type { GetByPointer, JsonValue };
