import type { EChartsOption } from 'echarts';

export interface StackBarSeries {
  name: string;
  values: number[];
}

export const DEFAULT_SALES_COLOR: Record<string, string> = {
  云南解化: '#007FBA', // 蓝
  四川泸天化: '#F7BA1E', // 黄
  广安玖源: '#DCE3EA', // 灰
  重庆建峰: '#00B42A', // 绿
  云南越聚: '#1EF7F7', // 青
};

/** ---- 工具：hex 转 rgba / 生成纵向渐变 ---- */
const hexToRgb = (hex: string) => {
  const s = hex.replace('#', '');
  const n =
    s.length === 3
      ? s
          .split('')
          .map((c) => c + c)
          .join('')
      : s;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return { r, g, b };
};
const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const verticalGradient = (hex: string, topA = 0.95, bottomA = 0.18) => ({
  type: 'linear' as const,
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: rgba(hex, topA) }, // 顶部更实
    { offset: 1, color: rgba(hex, bottomA) }, // 底部更浅（近似截图效果）
  ],
});

interface BuildParams {
  dates: string[];
  stackSeries: StackBarSeries[];
  colors?: Record<string, string>;
  order?: string[]; // 组内顺序（左→右）
  gridBg?: string;
  barWidth?: number; // 每根柱宽（px）
  barGap?: string | number; // 组内柱间距
  barCategoryGap?: string | number; // 组间距
}

export function buildSalesStackOption({
  dates,
  stackSeries,
  colors = DEFAULT_SALES_COLOR,
  order,
  gridBg = '#ffffff',
  barWidth = 4, // ✅ 4px 细柱
  barGap = '40%', // ✅ 组内间距
  barCategoryGap = '60%', // ✅ 组间距
}: BuildParams): EChartsOption {
  const effOrder = (order && order.length ? order : stackSeries.map((s) => s.name)) as string[];

  // 分组柱：同一类目下并排 n 根，不 stack
  const series = effOrder.map((name, idx) => {
    const s = stackSeries.find((x) => x.name === name);
    const base = colors[name] ?? '#94a3b8';

    return {
      name,
      type: 'bar' as const,
      barWidth, // ✅ 每条都强制 4px
      barMinWidth: barWidth,
      barMaxWidth: barWidth,
      barGap, // ✅ 组内间距
      barCategoryGap, // ✅ 组间距
      itemStyle: {
        color: verticalGradient(base), // ✅ 纵向渐变
        borderRadius: [2, 2, 0, 0],
        borderColor: rgba('#FFFFFF', 0.9), // 细白边让 4px 柱更清晰
        borderWidth: 1,
      },
      emphasis: {
        focus: 'series' as const,
        itemStyle: { color: verticalGradient(base, 1, 0.28) }, // hover 略实
      },
      barMinHeight: 1,
      data: s?.values ?? [],
      z: 3 + idx,
    };
  });

  return {
    grid: {
      left: 0,
      right: 0,
      top: 41, // 给标题/图例让位
      bottom: 6,
      show: true,
      backgroundColor: gridBg,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: (params: any) => {
        const arr = Array.isArray(params) ? params : [params];
        const name = arr?.[0]?.name ?? '';
        const list = arr
          .map((p: any) => `<div>${p.marker}${p.seriesName}：${p.data ?? 0}</div>`)
          .join('');
        const total = arr.reduce((a: number, b: any) => a + (Number(b.data) || 0), 0);
        return `<div style="margin-bottom:4px;">${name}</div>${list}<div style="margin-top:4px;">合计：${total}</div>`;
      },
    },
    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      // ✅ 用纯色渲染 legend 小块，避免渐变出现在图例
      data: effOrder.map((n) => ({ name: n, itemStyle: { color: colors[n] ?? '#94a3b8' } })),
      textStyle: { color: '#475569', fontSize: 9 },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: true,
      axisTick: { alignWithLabel: true },
      axisLabel: { interval: 0, fontSize: 9, color: '#64748B', margin: 12 },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 2400, // 与稿面一致
      interval: 400,
      axisLabel: { fontSize: 9, color: '#64748B' },
      splitLine: { lineStyle: { color: '#EDF2F7' } },
    },
    series,
  };
}

// 周对比工具（保留）
/** 上/下/平 样式与箭头（周对比一行用） */
export const arrow = (d: number) => {
  if (d > 0) return '▲';
  if (d < 0) return '▼';
  return '—';
};

export const dirClass = (d: number) => {
  if (d > 0) return 'up';
  if (d < 0) return 'down';
  return 'flat';
};
