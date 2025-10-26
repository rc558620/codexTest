// 安全格式化数字（防 null/undefined/NaN）
export const safeNum = (value: number | undefined | null, fallback = 0): number =>
  typeof value === 'number' && !isNaN(value) ? value : fallback;

// 安全字符串显示（防 null/undefined）
export const safeStr = (str: string | undefined | null, fallback = ''): string =>
  typeof str === 'string' ? str : fallback;

export function cx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(' ');
}

export function dirOf(n: number): 'up' | 'down' | 'flat' {
  if (n > 0) return 'up';
  if (n < 0) return 'down';
  return 'flat';
}

/** 数组安全判定 */
export const isNonEmptyArray = <T>(arr: T[] | undefined | null): arr is T[] =>
  Array.isArray(arr) && arr.length > 0;
