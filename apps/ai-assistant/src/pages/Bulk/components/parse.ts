import { transformToPriceRows } from '../types';
import type { ParsedBulkData, PriceRow, RawBulkRow, WeeklyNewsItem } from './types';

/** JSON 工具 */
const looksLikeJson = (s: string): boolean => {
  const t = s.trim();
  return (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'));
};

function safeParse<T>(input: string): T | undefined {
  try {
    return JSON.parse(input) as T;
  } catch {
    return undefined;
  }
}

/** RawBulkRow → ParsedBulkData */
export function toParsed(row?: RawBulkRow): ParsedBulkData | undefined {
  if (!row) return undefined;

  const blocks: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, val]) => {
    if (key === 'Date') return;
    if (typeof val === 'string' && looksLikeJson(val)) {
      const parsed = safeParse<unknown>(val);
      blocks[key] = parsed !== undefined ? parsed : val;
    } else {
      blocks[key] = val as unknown;
    }
  });

  const candidate = Object.values(blocks).find((v) => {
    if (!v || typeof v !== 'object') return false;
    const obj = v as Record<string, unknown>;
    const dt = String((obj as any).DataTitle ?? '');
    const hasTypical = 'CnTherma' in obj || 'CnAnthra' in obj;
    return dt.includes('市场价格分析') || hasTypical;
  }) as Record<string, unknown> | undefined;

  let priceTitle: string | undefined;
  let priceRows: PriceRow[] | undefined;
  if (candidate) {
    const { dataTitle, priceRowsArray } = transformToPriceRows(candidate);
    priceTitle = (dataTitle ?? '') as string;
    priceRows = (priceRowsArray ?? []) as PriceRow[];
  }

  const parsed: ParsedBulkData = {
    dateText: (row.Date ?? undefined) as string | undefined,
    priceTitle,
    priceRows,
    blocks,
  };
  return parsed;
}

/** Interpret 数据映射 */
const toStr = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

function mapNodeToItem(key: string, node: any): WeeklyNewsItem {
  const nd = node && typeof node === 'object' ? (node as Record<string, unknown>) : {};
  return {
    key,
    class: toStr((nd as any).Class, ''),
    supplyTitle: toStr((nd as any).SupplyTitle, ''),
    supplyContent: toStr((nd as any).SupplyContent, ''),
    demandTitle: toStr((nd as any).DemandTitle, ''),
    demandContent: toStr((nd as any).DemandContent, ''),
    costTitle: toStr((nd as any).CostTitle, ''),
    costContent: toStr((nd as any).CostContent, ''),
    overviewTitle: toStr((nd as any).OverviewTitle, ''),
    overviewContent: toStr((nd as any).OverviewContent, ''),
  };
}

export function mapDataAnalysis(blocks?: Record<string, unknown>): {
  interpretTitle: string;
  interpretItems: WeeklyNewsItem[];
} {
  const da = (blocks as any)?.DataAnalysis as any;
  if (!da || typeof da !== 'object') return { interpretTitle: '', interpretItems: [] };

  const title = toStr(da.DataTitle, '');
  const items: WeeklyNewsItem[] = [];

  if (da.CurrentAnalysis && typeof da.CurrentAnalysis === 'object') {
    items.push(mapNodeToItem('CurrentAnalysis', da.CurrentAnalysis));
  }
  if (da.NextAnalysis && typeof da.NextAnalysis === 'object') {
    items.push(mapNodeToItem('NextAnalysis', da.NextAnalysis));
  }

  return { interpretTitle: title, interpretItems: items };
}
