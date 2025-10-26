export interface SeriesPoint {
  date: string;
  value: number;
}
export interface LineSeries {
  name: string;
  points: SeriesPoint[];
}
export interface InventoryRow {
  name: string;
  values: number[];
}

const nf = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
export const fmt = (n: number): string => nf.format(n);
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
export const last = <T>(arr: T[]): T | undefined => (arr.length ? arr[arr.length - 1] : undefined);
export const makeDates = (startDay = 1, days = 11): string[] =>
  range(days).map((i) => `2025/8/${startDay + i}`);

export const delta = (curr: number, prev: number): { v: number; dir: 'up' | 'down' | 'flat' } => {
  const diff = +(curr - prev).toFixed(1);
  if (diff > 0) return { v: diff, dir: 'up' };
  if (diff < 0) return { v: diff, dir: 'down' };
  return { v: diff, dir: 'flat' };
};
