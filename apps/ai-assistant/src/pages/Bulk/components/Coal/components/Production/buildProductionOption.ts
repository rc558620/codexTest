// src/pages/Bulk/components/Production/buildProductionOption.ts
import type { EChartsOption } from 'echarts';

export interface BuildProductionOptionParams {
  dates: string[]; // x 轴类目
  barName?: string; // 柱子系列名，默认“库存”
  barData: number[]; // 柱子数据
  lineName?: string; // 折线系列名，默认“日耗量”
  lineData: number[]; // 折线数据
  // 视觉（可选，给默认值与现有一致）
  barWidth?: number;
  barColorFrom?: string;
  barColorTo?: string; // 渐变到底透明
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
  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: 68, bottom: 0 },
    tooltip: { trigger: 'axis' },
    legend: [
      {
        type: 'plain',
        orient: 'vertical',
        left: 0,
        top: 3,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 8,
        data: [{ name: barName }],
        textStyle: { color: legendTextColor },
        itemStyle: { color: barColorFrom },
      },
      {
        type: 'plain',
        orient: 'vertical',
        left: 0,
        top: 29,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 8,
        data: [{ name: lineName }],
        textStyle: { color: legendTextColor },
      },
    ],
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { formatter: (v: string) => (typeof v === 'string' ? v.slice(5) : v) },
    },
    yAxis: { type: 'value' },
    series: [
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
      },
      {
        name: lineName,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: lineData,
        itemStyle: { color: lineColor },
        lineStyle: {
          color: lineColor,
          width: 4,
          shadowColor: 'rgba(247, 186, 30, 0.4)',
          shadowBlur: 4,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        },
        zlevel: 3,
        z: 10,
        emphasis: { focus: 'series' as const },
      },
    ],
  };

  return option;
}
