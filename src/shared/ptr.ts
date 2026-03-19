import { INVALID_KEYS, RE_STRICT_UINT } from './constants';
import { decodePointerKey } from './decode';

/**
 * 将 JSON Pointer 转换为链式访问路径
 * @param path - JSON Pointer
 */
export function transformPointerToChain(path: string): string {
  // 根路径处理
  if (path === '' || path === '/') return '';

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 切分逻辑
  const segments = normalizedPath.split('/').slice(1);

  if (segments.length > 1 && segments[segments.length - 1] === '') {
    segments.pop();
  }

  let chain = '';

  for (const rawKey of segments) {
    // 解码
    const key = decodePointerKey(rawKey);

    // 静态路径如果包含非法键，直接在编译期阻断
    if (INVALID_KEYS.has(key)) {
      throw new Error(
        `[volta-json-ptr] Security Risk: Forbidden key "${key}" found in static path "${path}"`,
      );
    }

    // 生成可选链片段
    const isUint = RE_STRICT_UINT.test(key);
    const accessor = isUint ? `[${key}]` : `[${JSON.stringify(key)}]`;

    chain += `?.${accessor}`;
  }

  return chain;
}
