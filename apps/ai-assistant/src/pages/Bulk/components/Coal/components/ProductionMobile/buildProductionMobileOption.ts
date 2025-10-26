// src/pages/Bulk/components/Production/buildProductionOption.ts
import type { EChartsOption } from 'echarts';

export interface BuildProductionOptionParams {
  dates: string[];
  barName?: string;
  barData: number[];
  lineName?: string;
  lineData: number[];
  // 视觉
  barWidth?: number;
  barColorFrom?: string;
  barColorTo?: string;
  barRadius?: [number, number, number, number];
  lineColor?: string;
  legendTextColor?: string;
}

export type Tone = 'up' | 'down' | 'neutral' | 'three' | 'four';
export const getPillColors = (tone: Tone) => {
  switch (tone) {
    case 'up':
      return { bg: '#E5F7E9', color: '#00B42A' };
    case 'down':
      return { bg: '#FEEBEB', color: '#F53F3F' };
    case 'three':
      return { bg: '#EBFAFF', color: '#007FBA' };
    case 'four':
      return { bg: '#FFF8E8', color: '#F7BA1E' };
    default:
      return { bg: '#FFF8E8', color: '#334155' };
  }
};
export const getArrow = (tone: Tone): string => {
  if (tone === 'up') return '↑';
  if (tone === 'down') return '↓';
  return '';
};

export function buildProductionOption({
  dates,
  barName = '库存',
  barData,
  lineName = '日耗量',
  lineData,
  barWidth = 20,
  barColorFrom = '#007FBA',
  barColorTo = 'rgba(0,127,186,0)',
  barRadius = [12, 12, 0, 0],
  lineColor = '#F7BA1E',
  legendTextColor = '#475569',
}: BuildProductionOptionParams): EChartsOption {
  const LEGEND_TOP = 17;
  const GRID_TOP = 54;

  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: GRID_TOP, bottom: 0 },
    tooltip: { trigger: 'axis' },

    // ✅ legend 一行靠左，字号 9（不会显示渐变）
    legend: {
      type: 'plain',
      orient: 'horizontal',
      left: 0,
      top: LEGEND_TOP,
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 16,
      textStyle: { color: legendTextColor, fontSize: 9 },
      data: [{ name: barName }, { name: lineName }],
    },

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: true,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.slice(5) : v),
        fontSize: 9, // ✅ 字号 9
        color: '#64748B',
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },

    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 9, color: '#64748B' }, // ✅ 字号 9
      splitLine: { lineStyle: { color: '#EEF2F7' } },
    },

    series: [
      // ✅ 代理系列：同名、纯色、无数据、不可交互 —— 只为 legend 提供纯色图标
      {
        name: barName,
        type: 'bar',
        data: [],
        barWidth: 0, // 不占宽
        silent: true,
        tooltip: { show: false },
        emphasis: { disabled: true },
        itemStyle: { color: barColorFrom }, // 纯色给 legend
        z: 0,
      },
      // 真正的柱子（渐变只用于图形，不影响 legend）
      {
        name: barName,
        type: 'bar',
        barWidth,
        data: barData,
        itemStyle: {
          borderRadius: barRadius,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: barColorFrom },
              { offset: 1, color: barColorTo },
            ],
          },
        },
        z: 2,
      },
      // 折线
      {
        name: lineName,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: lineData,
        color: lineColor,
        lineStyle: {
          color: lineColor,
          width: 3,
          shadowColor: 'rgba(247, 186, 30, 0.4)',
          shadowBlur: 3,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        },
        emphasis: { focus: 'series' as const },
        z: 3,
      },
    ],
  };

  return option;
}
