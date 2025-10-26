// src/pages/Bulk/components/Price/coalPriceOption.ts
import type { EChartsOption, LegendComponentOption } from 'echarts';

export interface Point {
  date: string;
  value: number | null | undefined;
}
export interface LineSeries {
  name: string; // 曲线名称（已做括号拆分的话，用主标题 name 即可）
  points: Point[]; // 与 dates 对齐
}

export interface BuildCoalPriceOptionParams {
  dates: string[]; // x 轴
  baseSeries: LineSeries[]; // 动态曲线（任意条）
  enableAI?: boolean; // 仅影响 legend：是否展示 AI 预测占位
  aiLegend?: string[]; // 自定义 AI 图例名（可选）
  legendTop?: number; // legend 顶部偏移（默认 8）
  gridTop?: number; // grid 顶部（默认 55, 给多行 legend 留空间）
  smooth?: boolean; // 折线平滑（默认 true）
  colorMap?: Record<string, string>; // 指定部分系列颜色（可选；未指定的自动分配）
}

/* ======================== 小工具 ======================== */

/** 方向图标（表格 summary 仍会用到） */
export const getDirectionIcon = (direction: string): string => {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '—';
};

/** 稳定配色：将系列名哈希到固定调色板，确保同名曲线颜色稳定 */
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

/** Legend 工具：靠左、超宽自动换行 */
function makeLegend(data: string[], top = 8): LegendComponentOption {
  const legend: LegendComponentOption = {
    type: 'plain',
    orient: 'horizontal',
    icon: 'roundRect',
    top,
    left: 'center',
    itemWidth: 8,
    itemHeight: 2,
    itemGap: 16,
    textStyle: { color: '#475569' },
    data,
  };
  return legend;
}

/* ======================== 主函数：完全动态 ======================== */

export function buildCoalPriceOption({
  dates,
  baseSeries,
  enableAI = true,
  aiLegend = [],
  legendTop = 8,
  gridTop = 55,
  smooth = true,
}: BuildCoalPriceOptionParams): EChartsOption {
  // —— 组装 legend（AI 仅占位，不画线） ——
  const baseLegend = baseSeries.map((s) => s.name);
  const legendData = enableAI ? [...aiLegend, ...baseLegend] : [...baseLegend];

  // —— 动态系列：从 baseSeries 渲染任意条折线 ——
  const series = baseSeries.map((s, index) => {
    // 对 value 做安全转换：非法值用 null（ECharts 会断线）
    const data = s.points.map((p) => {
      const n = Number(p?.value);
      return Number.isFinite(n) ? n : null;
    });

    // 按顺序使用 PALETTE 颜色，循环使用
    const colorIndex = index % PALETTE.length;

    return {
      name: s.name,
      type: 'line' as const,
      smooth,
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
      zlevel: 0,
      z: 0,
    };
  });

  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: gridTop, bottom: 35 },
    tooltip: {
      trigger: 'axis',
      confine: true, // 移动端避免溢出
      axisPointer: { type: 'line' },
      // 也可在这里自定义 formatter
    },
    legend: makeLegend(legendData, legendTop),
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        // 你若传的是 YYYY-MM-DD，这里保留到 MM-DD；其它格式可按需调整
        formatter: (v: string) => (typeof v === 'string' && v.length >= 5 ? v.slice(5) : v),
        color: '#64748B',
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748B' },
      splitLine: { lineStyle: { color: '#EEF2F7' } },
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
