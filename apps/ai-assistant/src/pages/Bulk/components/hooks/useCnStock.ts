// src/hooks/useCnStock.ts
import { useMemo } from 'react';

/* ======================== 类型 ======================== */
export type CnStockClassPair = Readonly<{
  ClassName: string;
  keyName: string;
}>;

export type CnStockBlock = Readonly<{
  DataTitle?: string;
  DataUnit?: string;
  DataSource?: string;
  DataChart?: Array<Record<string, unknown>>;
  DataClass?: CnStockClassPair[];
  DataForm?: Array<Record<string, unknown>>;
  /** 新增：图例/线型描述（后端可不传） */
  ChartLine?: string;
}>;

export type StackSeries = Readonly<{
  name: string;
  values: number[];
  color?: string;
}>;

export interface TableRow {
  key: string;
  日期: string;
  // 动态港口字段：数值或 null
  [portName: string]: string | number | null | undefined;
}

export type ColumnMeta = Readonly<{
  /** 原始 ClassName，例如：富源雄达煤矿(Q3600) */
  className: string;
  /** ECharts legend/表头主标题：括号外部的主体部分，例如：富源雄达煤矿 */
  name: string;
  /** 用于取数的 keyName，例如：Fyxdq3600Price */
  key: string;
  /** 由括号提取的徽标（若存在），例如：Q3600 */
  badge?: string;
}>;

export type ParsedCnStock = Readonly<{
  // 展示文案
  title?: string;
  unit?: string;
  source?: string;

  /** 图例/线型文案（后端未给则为空字符串） */
  ChartLine: string;

  // 图表
  dates?: string[];
  stacks?: StackSeries[];
  legendOrder?: string[]; // 建议用 columnsMeta.name 顺序

  // 表格
  columnsMeta: ColumnMeta[];
  tableRowsAll: TableRow[];
}>;

/* ======================== 小工具 ======================== */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** 生成随机 row key（日期为空时防冲突） */
const randomKey = () => Math.random().toString(36).slice(2);

/**
 * 分离表头：把 "名称(角标)" / "名称（角标）" 拆成 { name: 名称, badge: 角标 }
 * - 若无括号，badge 为 undefined
 * - 若出现多个括号，取**最后一对**括号内容
 */
export const splitHeader = (classNameRaw: string): { name: string; badge?: string } => {
  const s = String(classNameRaw ?? '').trim();
  if (!s) return { name: '' };

  // 捕获最后一对 () 或 （）
  const rightIdx = Math.max(s.lastIndexOf(')'), s.lastIndexOf('）'));
  if (rightIdx === -1) return { name: s };

  const leftIdxHalf = s.lastIndexOf('(', rightIdx);
  const leftIdxFull = s.lastIndexOf('（', rightIdx);
  const leftIdx = Math.max(leftIdxHalf, leftIdxFull);
  if (leftIdx === -1 || leftIdx >= rightIdx) return { name: s };

  const name = s.slice(0, leftIdx).trim();
  const badge = s.slice(leftIdx + 1, rightIdx).trim();
  return { name: name || s, badge: badge || undefined };
};

/* ======================== 主 Hook ======================== */

/**
 * 解析后端传入的 cnStock 动态块（不写死字段）
 * - 表格数据严格来自 DataForm（保留全部行）
 * - 图表数据来自 DataChart（**不再裁剪尾部空点**）
 * - 列元信息 ColumnMeta 自动拆分 name/badge
 * - ChartLine：后端未传则返回空字符串
 */
export function useCnStock(cnStock: unknown): ParsedCnStock {
  return useMemo<ParsedCnStock>(() => {
    if (!isRecord(cnStock)) {
      return { columnsMeta: [], tableRowsAll: [], ChartLine: '' };
    }

    const block: CnStockBlock = {
      DataTitle: String(cnStock.DataTitle ?? ''),
      DataUnit: String(cnStock.DataUnit ?? ''),
      DataSource: String(cnStock.DataSource ?? ''),
      DataChart: Array.isArray(cnStock.DataChart)
        ? (cnStock.DataChart as Array<Record<string, unknown>>)
        : [],
      DataClass: Array.isArray(cnStock.DataClass) ? (cnStock.DataClass as CnStockClassPair[]) : [],
      DataForm: Array.isArray(cnStock.DataForm)
        ? (cnStock.DataForm as Array<Record<string, unknown>>)
        : [],
      ChartLine: String((cnStock as any).ChartLine ?? ''), // 安全取值
    };

    // ---- 列元信息（含 badge）----
    const columnsMeta: ColumnMeta[] = (block.DataClass ?? []).map((c) => {
      const { name, badge } = splitHeader(c.ClassName);
      return {
        className: c.ClassName,
        name,
        key: c.keyName,
        badge,
      } as const;
    });

    // ---- 图表（DataChart：不裁剪，原样解析）----
    const dates: string[] = (block.DataChart ?? [])
      .map((r) => String(r.Date ?? ''))
      .filter(Boolean);

    const stacks: StackSeries[] = columnsMeta.map((col) => {
      const values = (block.DataChart ?? []).map((r) => {
        const n = Number((r as any)[col.key]);
        return Number.isFinite(n) ? n : 0; // 渲染层若想显示“空”，可以在图层把 0 当 null 处理
      });
      return { name: col.name, values } as const;
    });

    // ---- 表格（DataForm：保留全部行；null 由渲染时处理）----
    const tableRowsAll: TableRow[] = (block.DataForm ?? []).map((r) => {
      const d = String(r.Date ?? '');
      const row: TableRow = {
        key: d || randomKey(),
        日期: d,
      };
      columnsMeta.forEach((col) => {
        const raw = (r as any)[col.key] as unknown;
        row[col.name] = raw == null || Number.isNaN(Number(raw)) ? null : Number(raw);
      });
      return row;
    });

    const parsed: ParsedCnStock = {
      title: block.DataTitle || undefined,
      unit: block.DataUnit || undefined,
      source: block.DataSource || undefined,
      ChartLine: block.ChartLine ?? '',
      dates: dates.length ? dates : undefined,
      stacks: stacks.length ? stacks : undefined,
      legendOrder: columnsMeta.map((c) => c.name),
      columnsMeta,
      tableRowsAll,
    };
    return parsed;
  }, [cnStock]);
}

/* ========== 可选：把“只取前两行 + 第三行作为环比”封装为辅助模型 ========== */

export function useCnStockTableModel(parsed: ParsedCnStock): {
  /** 表格显示的两行（DataForm 第 1、2 行） */
  tableRows: TableRow[];
  /** 周环比行（DataForm 第 3 行），用于 Summary */
  hbRow?: TableRow;
  /** 列头（含 badge） */
  columnsMeta: ColumnMeta[];
} {
  const { tableRowsAll, columnsMeta } = parsed;
  return useMemo(
    () => ({
      tableRows: tableRowsAll.slice(0, 2),
      hbRow: tableRowsAll[2],
      columnsMeta,
    }),
    [tableRowsAll, columnsMeta],
  );
}
