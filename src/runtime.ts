import { RE_ESC_1, RE_ESC_0, RE_STRICT_UINT, INVALID_KEYS } from '#shared';
import type { GetByPointer, JsonValue } from '#shared';

export function seek<T extends JsonValue, P extends string>(obj: T, path: P): GetByPointer<T, P>;

export function seek(obj: any, path: string): JsonValue | undefined {
  // 根路径处理："" 或 "/" 指向原对象
  if (path === '' || path === '/') return obj;

  // 格式校验：非空路径必须以 "/" 开头
  if (path[0] !== '/') {
    throw new Error(`Invalid JSON pointer: "${path}". Path must begin with a forward slash.`);
  }

  // 路径切分
  const segments = path.split('/').slice(1);

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
    const key =
      rawKey.indexOf('~') !== -1 ? rawKey.replace(RE_ESC_1, '/').replace(RE_ESC_0, '~') : rawKey;

    if (INVALID_KEYS.has(key)) {
      return undefined;
    }

    // 属性访问逻辑
    if (Array.isArray(result)) {
      // 仅允许合法数字索引. "-" 在 get 操作中无意义, 返回 undefined
      if (key === '-' || !RE_STRICT_UINT.test(key)) {
        return undefined;
      }
      result = result[key as any];
    } else {
      // 对象访问, 包含对空字符串键名 "" 的支持
      result = result[key];
    }
  }

  return result;
}

export const peek = seek;

export type { GetByPointer, JsonValue };
