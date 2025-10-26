// src/pages/Bulk/components/Nh3/components/nh3PriceOptionMobile.ts
import type { EChartsOption } from 'echarts';

/** ===== 类型 ===== */
export interface Point {
  date: string;
  value: number | undefined; // 允许 undefined：在图上断线
}
export interface LineSeries {
  name: string;
  points: Point[];
}

/** ===== 调色板 ===== */
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

export const getDirectionIcon = (direction: 'up' | 'down' | 'flat' | string): string => {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '—';
};

/** ===== 主构建器：legend 居中 ===== */
export function buildNh3PriceOption(params: {
  dates: string[];
  baseSeries: LineSeries[];
  colorMap?: Record<string, string>; // 可选：覆盖颜色
}): EChartsOption {
  const { dates, baseSeries, colorMap } = params;

  const series = baseSeries.map((s, index) => {
    const color = colorMap?.[s.name] || PALETTE[index % PALETTE.length];
    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      legendHoverLink: false,
      data: s.points.map((p) => p.value ?? null), // undefined -> null
      itemStyle: { color },
      lineStyle: { width: 2, color },
      emphasis: { focus: 'series' as const },
      zlevel: 0,
      z: 0,
    };
  });

  return {
    grid: { left: 10, right: 10, top: 48, bottom: 35 },
    tooltip: { trigger: 'axis' },
    legend: {
      type: 'plain',
      orient: 'horizontal',
      left: 'center',
      top: 10,
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 2,
      itemGap: 16,
      textStyle: { color: '#475569', align: 'center' },
      data: baseSeries.map((s) => s.name),
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.slice(5) : v),
        color: '#64748B',
        margin: 12,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748B' },
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
