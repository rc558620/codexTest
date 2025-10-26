import { PriceRow } from './components/MarketPriceAnalysis';

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

export const nf = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });
export const formatNumber = (n: number): string => nf.format(n);
export const range = (count: number): number[] => Array.from({ length: count }, (_, i) => i);
export const last = <T>(arr: T[]): T | undefined => (arr.length ? arr[arr.length - 1] : undefined);
export const makeDates = (startDay = 1, days = 11): string[] =>
  range(days).map((i) => `2025/8/${startDay + i}`);

// // 原始接口（宽松）
interface RawSection {
  Product?: string; // -> title（优先）
  Metrics?: string; // -> priceIndex（新增），也可作为 title 兜底
  Current?: {
    CurrDate?: string; // -> lastDate
    CurrTitle?: string; // -> lastTitle
    CurrValue?: number; // -> lastAvgPrice
    CurrUnit?: string; // -> unit 优先来源
    WowTitle?: string; // -> lastChain
    WowValue?: number; // -> lastWoW
  };
  Next?: {
    NextDate?: string; // -> forecastDate
    NextTitle?: string; // -> forecastTitle
    NextValue?: number; // -> forecastPrice
    NextUnit?: string; // -> unit 备选来源
    WowTitle?: string; // -> forecastChain
    WowValue?: number; // -> forecastWoW
  };
}

interface RawData {
  DataTitle?: string;
  [k: string]: RawSection | unknown;
}

export function transformToPriceRows(data: RawData): {
  dataTitle: string | undefined;
  priceRowsArray: PriceRow[];
} {
  const dataTitle = data?.DataTitle as string | undefined;

  const priceRowsArray: PriceRow[] = Object.entries(data)
    .filter(([key]) => key !== 'DataTitle')
    .map(([, section]) => section as RawSection)
    .filter((sec) => typeof sec === 'object' && sec != null)
    .map((sec) => {
      const priceIndex = sec.Metrics?.trim(); // ← 新增映射

      const title =
        sec.Product?.trim() ||
        priceIndex || // 没有 Product 时用 Metrics 兜底
        '未命名品类';

      const lastAvgPrice = Number(sec.Current?.CurrValue ?? NaN);
      const lastWoW = Number(sec.Current?.WowValue ?? NaN);
      const lastTitle = sec.Current?.CurrTitle?.trim();
      const lastChain = sec.Current?.WowTitle?.trim();
      const lastDate = sec.Current?.CurrDate?.trim();

      const forecastPrice = Number(sec.Next?.NextValue ?? NaN);
      const forecastWoW = Number(sec.Next?.WowValue ?? NaN);
      const forecastTitle = sec.Next?.NextTitle?.trim();
      const forecastChain = sec.Next?.WowTitle?.trim();
      const forecastDate = sec.Next?.NextDate?.trim();

      const unit = sec.Current?.CurrUnit?.trim() || sec.Next?.NextUnit?.trim() || '';

      const row: PriceRow = {
        title,
        priceIndex,
        lastAvgPrice,
        lastWoW,
        lastTitle,
        lastChain,
        lastDate,
        forecastPrice,
        forecastWoW,
        forecastTitle,
        forecastChain,
        forecastDate,
        unit,
      };

      if (
        Number.isNaN(lastAvgPrice) ||
        Number.isNaN(lastWoW) ||
        Number.isNaN(forecastPrice) ||
        Number.isNaN(forecastWoW)
      ) {
        row.disabled = true;
      }

      return row;
    });

  return { dataTitle, priceRowsArray };
}
