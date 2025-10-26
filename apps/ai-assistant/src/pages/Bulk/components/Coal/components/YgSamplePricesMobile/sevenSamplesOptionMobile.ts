import type { EChartsOption, LegendComponentOption } from 'echarts';

export interface Point {
  date: string;
  value: number | null | undefined;
}
export interface LineSeries {
  name: string;
  points: Point[];
}

export const getDirectionIcon = (dir: 'up' | 'down' | 'flat'): string => {
  if (dir === 'up') return '▲';
  if (dir === 'down') return '▼';
  return '—';
};

/* ============ 稳定配色：哈希到调色板 ============ */
const PALETTE = [
  '#1EF7F7',
  '#007FBA',
  '#00B42A',
  '#F53F3F',
  '#722ED1',
  '#F7BA1E',
  '#A5A5A5',
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#F59E0B',
  '#14B8A6',
  '#6366F1',
  '#84CC16',
] as const;

/* ============ Legend：靠左 + 宽度限制 → 自动换行 ============ */
function makeLegend(data: string[], top = 10): LegendComponentOption {
  return {
    type: 'plain',
    orient: 'horizontal',
    left: 8,
    right: 8,
    top,
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 8,
    textStyle: { color: '#475569', fontSize: 9 },
    data,
  };
}

/* ============ 主函数：完全动态 & 耐空数据 ============ */
export function buildSevenSamplesOption(params: {
  dates: string[];
  baseSeries: LineSeries[];
}): EChartsOption {
  const { dates, baseSeries } = params;

  const safeDates = Array.isArray(dates) ? dates : [];
  const safeSeries = Array.isArray(baseSeries) ? baseSeries : [];

  const legendData = safeSeries.map((s) => s.name);

  const series = safeSeries.map((s, index) => {
    const data = s.points.map((p) => {
      const n = Number(p?.value);
      return Number.isFinite(n) ? n : null; // 非法值用 null → 断线
    });

    // 按顺序使用 PALETTE 颜色，循环使用
    const colorIndex = index % PALETTE.length;

    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data,
      legendHoverLink: false,
      lineStyle: {
        width: 2,
        color: PALETTE[colorIndex], // 设置线条颜色
      },
      itemStyle: {
        // 设置数据点颜色
        color: PALETTE[colorIndex],
      },
      emphasis: { focus: 'series' as const },
      z: 2,
    };
  });

  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: 70, bottom: 25 },
    tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'line' } },
    legend: makeLegend(legendData, 10),
    xAxis: {
      type: 'category',
      data: safeDates,
      boundaryGap: false,
      axisLabel: {
        margin: 10,
        formatter: (v: string) => (typeof v === 'string' ? v.replace(/^(\d{4})[/-]/, '') : v),
        fontSize: 9,
        color: '#64748B',
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

  return option;
}
