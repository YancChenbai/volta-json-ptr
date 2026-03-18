type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

/**
 * 递归还原 JSON Pointer 转义
 */
type DecodePointer<S extends string> = S extends `${infer T}~1${infer U}`
  ? `${T}/${DecodePointer<U>}`
  : S extends `${infer T}~0${infer U}`
    ? `${T}~${DecodePointer<U>}`
    : S;

/**
 * 严格数字检查 (RE_STRICT_UINT)
 */
type IsStrictUint<S extends string> = S extends '0'
  ? true
  : S extends `${infer F}${infer R}`
    ? F extends '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
      ? R extends ''
        ? true
        : R extends `${number}`
          ? R extends `${string}.${string}`
            ? false
            : true
          : false
      : false
    : false;

/**
 * 访问处理：对齐运行时逻辑
 */
type PathToType<T, K extends string> = T extends any
  ? DecodePointer<K> extends keyof T
    ? T[DecodePointer<K>]
    : K extends `${infer _N extends number}`
      ? IsStrictUint<K> extends true
        ? _N extends keyof T
          ? T[_N]
          : undefined
        : undefined
      : undefined
  : never;

/**
 * 递归解析 JSON Pointer
 */
export type GetByPointer<T, P extends string> = P extends '' | '/'
  ? T
  : P extends `/${infer Head}/${infer Tail}`
    ? Tail extends ''
      ? PathToType<T, Head>
      : GetByPointer<PathToType<T, Head>, `/${Tail}`>
    : P extends `/${infer Last}`
      ? PathToType<T, Last>
      : T;
