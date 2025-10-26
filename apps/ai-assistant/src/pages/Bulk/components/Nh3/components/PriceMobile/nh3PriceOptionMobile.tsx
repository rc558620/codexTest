// src/pages/Bulk/components/Nh3/components/nh3PriceOptionMobile.ts
import type { EChartsOption, LegendComponentOption } from 'echarts';

/** ===== 类型 ===== */
export interface Point {
  date: string;
  value: number | undefined; // 允许 undefined：让 ECharts 断线
}
export interface LineSeries {
  name: string;
  points: Point[];
}

/** ===== 小工具：方向图标 ===== */
export const getDirectionIcon = (direction: 'up' | 'down' | 'flat' | string): string => {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '—';
};

/** ===== 动态配色（无位运算） ===== */
const PALETTE = [
  '#007FBA',
  '#00B42A',
  '#F53F3F',
  '#34D399',
  '#F7BA1E',
  '#F59E0B',
  '#EF6C6C',
  '#9AA0A6',
  '#722ED1',
  '#13C2C2',
  '#3B82F6',
  '#8B5CF6',
  '#06B6D4',
];

/** ===== legend 文本宽度估算 & 自动换行（无位运算） ===== */
function estimateTextWidth(text: string, fontSize = 9): number {
  // ASCII 约 0.6em，非 ASCII 约 1em：经验估算即可
  let w = 0;
  for (let i = 0; i < text.length; i += 1) {
    const cp = text.codePointAt(i) ?? 0;
    w += cp <= 0x7f ? 0.6 * fontSize : 1 * fontSize;
    if (cp > 0xffff) i += 1; // 代理对
  }
  return w;
}

function splitLegendRows(
  names: string[],
  maxContentWidth = 300,
  opts: { fontSize?: number; itemGap?: number; iconWidth?: number; iconLabelGap?: number } = {},
): string[][] {
  const fontSize = opts.fontSize ?? 9;
  const itemGap = opts.itemGap ?? 10;
  const iconWidth = opts.iconWidth ?? 8;
  const iconLabelGap = opts.iconLabelGap ?? 4;

  const rows: string[][] = [];
  let curr: string[] = [];
  let used = 0;

  names.forEach((name, idx) => {
    const textW = estimateTextWidth(name, fontSize);
    const itemW = (curr.length > 0 ? itemGap : 0) + iconWidth + iconLabelGap + textW;

    if (used + itemW <= maxContentWidth) {
      curr.push(name);
      used += itemW;
    } else if (curr.length === 0) {
      rows.push([name]); // 单个太长时独占一行
      used = 0;
    } else {
      rows.push(curr);
      curr = [name];
      used = iconWidth + iconLabelGap + textW;
    }

    if (idx === names.length - 1 && curr.length) rows.push(curr);
  });

  return rows;
}

/** ===== 主构建器 ===== */
export function buildNh3PriceOption(params: {
  dates: string[];
  baseSeries: LineSeries[];
  legendMaxContentWidth?: number;
  colorMap?: Record<string, string>; // 如果后端给了专用颜色，可传入覆盖
}): EChartsOption {
  const { dates, baseSeries, legendMaxContentWidth, colorMap } = params;

  const names = baseSeries.map((s) => s.name);
  const legendRows = splitLegendRows(names, legendMaxContentWidth ?? 300);
  const legendRowHeight = 22;

  const makeLegendRow = (data: string[], top: number): LegendComponentOption => ({
    type: 'plain',
    orient: 'horizontal',
    left: 12,
    right: 12,
    top,
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 10,
    textStyle: { color: '#475569', fontSize: 9 },
    data,
  });

  const legends: LegendComponentOption[] = legendRows.map((r, i) =>
    makeLegendRow(r, 10 + i * legendRowHeight),
  );
  const gridTop = 44 + (legendRows.length - 1) * legendRowHeight;

  const series = baseSeries.map((s, index) => {
    // 按顺序使用 PALETTE 颜色，循环使用
    const colorIndex = index % PALETTE.length;

    // 如果 colorMap 中有指定颜色，则优先使用
    const seriesColor = colorMap?.[s.name] || PALETTE[colorIndex];

    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      legendHoverLink: false,
      data: s.points.map((p) => p.value), // 允许 null
      itemStyle: {
        color: seriesColor, // 设置数据点颜色
      },
      lineStyle: {
        width: 2,
        color: seriesColor, // 设置线条颜色
      },
      emphasis: { focus: 'series' as const },
      zlevel: 0,
      z: 0,
    };
  });

  return {
    grid: { left: 10, right: 10, top: gridTop, bottom: 25 },
    tooltip: { trigger: 'axis' },
    legend: legends,
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.slice(5) : v),
        fontSize: 9,
        color: '#64748B',
        margin: 12,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 9, color: '#64748B' },
      splitLine: { lineStyle: { color: '#EDF2F7' } },
      splitNumber: 8,
      min(value) {
        return Math.floor(value.min);
      },
      max(value) {
        return Math.ceil(value.max);
      },
    },
    series,
  };
}
