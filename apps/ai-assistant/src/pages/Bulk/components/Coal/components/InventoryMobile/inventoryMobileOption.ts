import type { EChartsOption, LegendComponentOption } from 'echarts';

export interface StackSeries {
  name: string;
  values: number[];
  color?: string; // 可传自定义色（HEX / rgba），没传用主题默认色
}

export const getDirectionSymbol = (dir: string) => {
  if (dir === 'up') return '▲';
  if (dir === 'down') return '▼';
  return '—';
};

/* ---------- 主题色 & 小工具 ---------- */
const PALETTE = [
  '#3B82F6', // 蓝
  '#60A5FA', // 浅蓝
  '#8B5CF6', // 紫
  '#F59E0B', // 橙
  '#EF4444', // 红
  '#9CA3AF', // 灰
  '#22D3EE', // 青
];

const AXIS_TEXT = '#7A8A99';
const GRID_LINE = '#E8F2FB';
const AXIS_LINE = '#E6EEF6';

// 修正 toRGBA（上面写错顺序，重写一个正确的）
const hexToRgba = (hex: string, alpha = 1) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const areaGradient = (base: string) => ({
  type: 'linear' as const,
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: hexToRgba(base, 0.28) },
    { offset: 1, color: hexToRgba(base, 0.02) },
  ],
});

/* ---------- 主配置函数（主题化） ---------- */
export function buildInventoryOption(params: {
  dates: string[];
  stacks: StackSeries[];
  legendOrder?: string[];
  smooth?: boolean;
}): EChartsOption {
  const { dates, stacks, legendOrder, smooth = true } = params;

  const names = legendOrder ?? stacks.map((s) => s.name);
  const byName = Object.fromEntries(stacks.map((s) => [s.name, s] as const));

  // 为没传 color 的系列分配主题色
  const pickColor = (name: string, i: number) => byName[name]?.color ?? PALETTE[i % PALETTE.length];

  const series = names
    .map((n, i) => {
      const s = byName[n];
      if (!s) return null;
      const base = pickColor(n, i);
      return {
        name: s.name,
        type: 'line' as const,
        stack: 'Total',
        showSymbol: false,
        smooth,
        legendHoverLink: false,
        emphasis: { focus: 'series' as const },
        // 细描边（更贴近设计）
        lineStyle: { width: 1.2, color: hexToRgba(base, 0.9) },
        // 柔和面积渐变
        areaStyle: { color: areaGradient(base) },
        data: s.values,
        z: 1,
      };
    })
    .filter(Boolean) as Array<NonNullable<any>>;

  // Legend（靠左、自动换行、小圆角短条）
  const legend: LegendComponentOption = {
    type: 'plain',
    orient: 'horizontal',
    left: 10,
    right: 10,
    top: 8,
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 8,
    textStyle: { color: '#475569', fontSize: 9 },
    data: names,
  };

  // 预留多行 legend 的高度
  const gridTop = 55;

  const option: EChartsOption = {
    // 整体背景透明，建议容器卡片用白底 + 圆角
    backgroundColor: 'transparent',
    color: PALETTE, // 让标注/legend marker 使用同一套主题色
    grid: { left: 0, right: 0, top: gridTop, bottom: 28 },
    legend,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#E5EEF9',
      borderWidth: 1,
      textStyle: { color: '#0E2540', fontSize: 12 },
      extraCssText:
        'box-shadow:0 6px 18px rgba(21,84,159,0.15);border-radius:8px;padding:8px 10px;',
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
      axisLabel: {
        color: AXIS_TEXT,
        fontSize: 9,
        margin: 10,
        formatter: (v: string) => (v?.length > 5 ? v.slice(5).replace(/-/, '/') : v),
      },
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
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: AXIS_TEXT, fontSize: 9 },
      splitLine: { lineStyle: { color: GRID_LINE } },
    },
    series,
  };

  return option;
}
