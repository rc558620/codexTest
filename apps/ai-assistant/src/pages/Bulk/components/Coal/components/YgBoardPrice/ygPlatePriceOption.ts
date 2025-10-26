// src/pages/Bulk/components/Price/ygPlatePriceMobileOption.ts
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

/* ============ 动态配色（稳定）：哈希到调色板 ============ */
const PALETTE = [
  '#007FBA',
  '#00B42A',
  '#F53F3F',
  '#722ED1',
  '#F7BA1E',
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#F59E0B',
  '#14B8A6',
  '#6366F1',
  '#84CC16',
  '#FB923C',
  '#DC2626',
] as const;

/* ============ Legend：靠左，超宽自动换行 ============ */
function makeLegend(data: string[], top = 10): LegendComponentOption {
  return {
    type: 'plain',
    orient: 'horizontal',
    top,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 16,
    textStyle: { color: '#475569' },
    data,
  };
}

/* ============ 主函数：完全动态 ============ */
export function buildYgPlatePriceOption(params: {
  dates: string[];
  baseSeries: LineSeries[];
}): EChartsOption {
  const { dates, baseSeries } = params;
  const legendData = baseSeries.map((s) => s.name);

  const series = baseSeries.map((s, index) => {
    const data = s.points.map((p) => {
      const n = Number(p?.value);
      return Number.isFinite(n) ? n : null; // 非法值用 null 断线
    });

    // 按顺序使用 PALETTE 颜色，如果超出数组长度则循环使用
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
        color: PALETTE[colorIndex], // 使用调色板中的颜色
      },
      itemStyle: {
        // 同时设置数据点颜色
        color: PALETTE[colorIndex],
      },
      emphasis: { focus: 'series' as const },
      z: 2,
    };
  });

  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: 64, bottom: 35 },
    tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'line' } },
    legend: makeLegend(legendData, 10),
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.replace(/^(\d{4})[/-]/, '') : v),
        margin: 12,
        color: '#64748B',
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

  return option;
}
