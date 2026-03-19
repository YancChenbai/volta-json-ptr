/**
 * 匹配严格的非负整数, 不含前导零，除了 0 本身
 */
export const RE_STRICT_UINT = /^(?:0|[1-9]\d*)$/;

/**
 * 危险键名集合
 */
export const INVALID_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * JSON Pointer 转义符正则表达式
 */
export const RE_ESC_1 = /~1/g;

/**
 * JSON Pointer 转义符正则表达式
 */
export const RE_ESC_0 = /~0/g;
