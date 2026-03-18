import MagicString from 'magic-string';

import { RE_STRICT_UINT, INVALID_KEYS, decodePointerKey } from '#shared';

export function transformPointerToChain(path: string, receiver: string): string {
  // 根路径处理
  if (path === '' || path === '/') return receiver;

  // 校验
  if (path[0] !== '/') {
    console.warn(`[volta-json-ptr] Security Risk: Path "${path}" is not a valid JSON pointer`);
    return receiver;
  }

  // 切分逻辑
  const segments = path.split('/').slice(1);

  if (segments.length > 1 && segments[segments.length - 1] === '') {
    segments.pop();
  }

  let chain = receiver;

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

const seekRegex =
  /(?:_?unref\s*\(\s*(?:\$setup\.|_ctx\.)?seek\s*\)|(?:\$setup\.|_ctx\.)?seek)\s*\(\s*([^,]+)\s*,\s*['"]([^'"]*)['"]\s*\)/g;
const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*['"]volta-json-ptr['"]\s*;?/g;

export function transform(code: string, id: string) {
  if (!code.includes('seek') && !code.includes('volta-json-ptr')) return null;

  const s = new MagicString(code);

  // transform seek
  const matches = [...code.matchAll(seekRegex)];

  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];

    if (!m) continue;

    const start = m.index!;
    const end = start + m[0].length;

    const receiver = m[1];
    const path = m[2];

    if (!path || !receiver) continue;

    const replacement = transformPointerToChain(path, receiver);

    s.overwrite(start, end, replacement);
  }

  // remove import
  for (const m of code.matchAll(importRegex)) {
    const [fullMatch, importContent] = m;
    const start = m.index!;
    const end = start + fullMatch.length;

    if (!importContent) continue;

    // 检查是否包含 seek
    if (importContent.includes('seek')) {
      // 将 seek 及其前后的逗号、空格替换为空
      // 这里的正则匹配 `seek` `seek,` `, seek`
      const newContent = importContent
        .replace(/\bseek\b\s*,?/g, '')
        .replace(/,\s*$/, '') // 清理末尾多余的逗号
        .trim();

      if (newContent.length === 0) {
        // 如果除了 seek 没别的东西了，直接删整行
        s.remove(start, end);
      } else {
        // 重构导入语句
        s.overwrite(start, end, `import { ${newContent} } from 'volta-json-ptr';`);
      }
    }
  }

  if (!s.hasChanged()) return null;

  return {
    code: s.toString(),
    map: s.generateMap({
      source: id,
      includeContent: true,
      hires: true,
    }),
  };
}
