/**
 * 输入验证函数
 */

const MIN_LENGTH = 1;
const MAX_LENGTH = 10;
const VALID_CHAR_REGEX = /^[a-z]+$/;

/**
 * 验证字符串长度是否在有效范围内 (1-10)
 * @param str 输入字符串
 * @returns true 如果长度有效
 */
export function validateLength(str: string): boolean {
  return str.length >= MIN_LENGTH && str.length <= MAX_LENGTH;
}

/**
 * 验证字符串是否只包含小写英文字母 (a-z)
 * @param str 输入字符串
 * @returns true 如果所有字符都是小写字母
 */
export function validateCharacters(str: string): boolean {
  if (str.length === 0) return false;
  return VALID_CHAR_REGEX.test(str);
}

/**
 * 验证输入是否完全有效（长度和字符都有效）
 * @param str 输入字符串
 * @returns true 如果输入完全有效
 */
export function validateInput(str: string): boolean {
  return validateLength(str) && validateCharacters(str);
}

/**
 * 过滤字符串，只保留小写字母
 * @param str 输入字符串
 * @returns 过滤后的字符串
 */
export function filterToLowercase(str: string): string {
  return str.toLowerCase().replace(/[^a-z]/g, '');
}
