import type { EChartsOption } from 'echarts';

export interface Point {
  date: string;
  value: number | null;
}
export interface LineSeries {
  name: string;
  points: Point[];
}

/** 方向图标/方向 —— 保留给表格使用 */
export const getDirIcon = (dir: 'up' | 'down' | 'flat') => {
  if (dir === 'up') return '▲';
  if (dir === 'down') return '▼';
  return '—';
};
export const toDir = (n: number): 'up' | 'down' | 'flat' => {
  if (n > 0) return 'up';
  if (n < 0) return 'down';
  return 'flat';
};

/** legend 细线图标（8×3） */
export const ICON_BAR_8x3 =
  'path://M1 2 H7 A1.5 1.5 0 0 1 8.5 3.5 A1.5 1.5 0 0 1 7 5 H1 A1.5 1.5 0 0 1 -0.5 3.5 A1.5 1.5 0 0 1 1 2 Z';

/** 颜色策略：
 *  - 如果外部传了 `colors[name]` 就用外部颜色
 *  - 否则按顺序从 PALETTE 分配（与名字无关，避免写死）
 */
const PALETTE = ['#007FBA', '#00B42A', '#F53F3F', '#F7BA1E', '#19C5F3', '#7C3AED', '#16A34A'];

interface BuildParams {
  dates: string[];
  baseSeries: LineSeries[];
  colors?: Record<string, string>;
  yMin?: number;
  yMax?: number;
  yInterval?: number;
  grid?: { left?: number; right?: number; top?: number; bottom?: number };

  // Legend 布局
  legendMaxContentWidth?: number; // 自适应换行最大内容宽度（未指定 itemsPerRow 时生效）
  legendItemsPerRow?: number; // 每行固定 N 个（优先级更高）
  legendRowHeight?: number; // 每行高度（含间距）
  legendAlign?: 'center' | 'left';
}

/** 估算文字宽度（避免 ^= 写法触发 eslint no-bitwise） */
function estimateTextWidth(text: string, fontSize = 9): number {
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    w += code <= 0x007f ? 0.6 * fontSize : 1 * fontSize;
  }
  return w;
}
function splitLegendRows(
  names: string[],
  maxContentWidth = 300,
  {
    fontSize = 9,
    itemGap = 10,
    iconWidth = 8,
    iconLabelGap = 4,
  }: { fontSize?: number; itemGap?: number; iconWidth?: number; iconLabelGap?: number } = {},
): string[][] {
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
      rows.push([name]);
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
function chunk<T>(arr: T[], n: number): T[][] {
  const size = Math.max(1, Math.floor(n));
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

export function buildYnGxH2so4Option({
  dates,
  baseSeries,
  colors,
  grid = { left: 0, right: 0, top: 41, bottom: 25 },

  legendMaxContentWidth,
  legendItemsPerRow = 4,
  legendRowHeight = 22,
  legendAlign = 'center',
}: BuildParams): EChartsOption {
  const names = baseSeries.map((s) => s.name);

  // name -> color（外部覆盖优先，否则按顺序取 PALETTE）
  const colorMap: Record<string, string> = {};
  names.forEach((n, i) => {
    colorMap[n] = colors?.[n] ?? PALETTE[i % PALETTE.length];
  });

  // series（样式保持原有）
  const series = baseSeries.map((s) => {
    const color = colorMap[s.name];
    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data: s.points.map((p) => p.value),
      lineStyle: { width: 2, color },
      itemStyle: { color },
      z: 10,
    };
  });

  // legend：固定每行 N 个（优先），否则自适应换行
  const rows =
    typeof legendItemsPerRow === 'number' && legendItemsPerRow > 0
      ? chunk(names, legendItemsPerRow)
      : splitLegendRows(names, legendMaxContentWidth ?? 300);

  const legends = rows.map((data, i) => ({
    type: 'plain' as const,
    top: 10 + i * legendRowHeight,
    left: legendAlign === 'center' ? ('center' as const) : 12,
    right: legendAlign === 'center' ? undefined : 12,
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 10,
    data: data.map((n) => ({
      name: n,
      icon: ICON_BAR_8x3,
      itemStyle: { color: colorMap[n] },
    })),
    textStyle: { color: '#475569', fontSize: 9 },
  }));

  const gridTop = (grid.top ?? 56) + Math.max(0, rows.length - 1) * legendRowHeight;

  return {
    grid: { ...grid, top: gridTop },
    tooltip: { trigger: 'axis' },
    legend: legends,
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.replace(/^(\d{4})\//, ''), fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      splitNumber: 8,
      min(value) {
        return Math.floor(value.min);
      },
      max(value) {
        return Math.ceil(value.max);
      },
      splitLine: { lineStyle: { color: '#EDF2F7' } },
      axisLabel: { fontSize: 9 },
    },
    series,
  };
}
