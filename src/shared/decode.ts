import { RE_ESC_1, RE_ESC_0 } from './constants';

/**
 * 解码 JSON Pointer 的单个键名
 * 
 * 将 ~1 还原为 /，将 ~0 还原为 ~
 */
export function decodePointerKey(key: string): string {
  return key.replace(RE_ESC_1, '/').replace(RE_ESC_0, '~');
}
