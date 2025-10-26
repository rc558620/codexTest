// src/pages/Bulk/components/Production/buildYgOption.ts
import type { EChartsOption } from 'echarts';

export interface YgOptionParams {
  dates: string[]; // x 轴
  ynInv: number[]; // 云南库存（面积）
  gzInv: number[]; // 贵州库存（面积）
  ynRun: number[]; // 云南开机率（折线）
  gzRun: number[]; // 贵州开机率（折线）
  // 文案（可覆盖）
  names?: {
    ynInv?: string;
    gzInv?: string;
    ynRun?: string;
    gzRun?: string;
  };
  // 颜色（可覆盖）
  colors?: {
    ynInv?: string; // 'rgba(0,127,186,0.85)'
    gzInv?: string; // 'rgba(184,187,106,0.85)'
    ynRun?: string; // '#6F3DF4'
    gzRun?: string; // '#F53F3F'
  };
  // legend 布局（两行两列）
  legendCol2Left?: number; // 第二列的 left
  legendRow1Top?: number; // 第一行 top
  legendRow2Top?: number; // 第二行 top
}
export const clsWow = (v?: number | null) => {
  if (!v) {
    return 'flat';
  }
  if (v > 0) {
    return 'up';
  }
  return 'down';
};
export function buildYgOption({
  dates,
  ynInv,
  gzInv,
  ynRun,
  gzRun,
  names = {
    ynInv: '云南电厂库存',
    gzInv: '贵州电厂库存',
    ynRun: '云南电厂开机率（%）',
    gzRun: '贵州电厂开机率（%）',
  },
  colors = {
    ynInv: 'rgba(0,127,186,0.85)',
    gzInv: 'rgba(184,187,106,0.85)',
    ynRun: '#6F3DF4',
    gzRun: '#F53F3F',
  },
  legendCol2Left = 150,
  legendRow1Top = 0,
  legendRow2Top = 26,
}: YgOptionParams): EChartsOption {
  return {
    grid: { left: 0, right: 48, top: 72, bottom: 6 },
    tooltip: { trigger: 'axis' },

    // 两行 legend：第 1 行库存；第 2 行开机率
    legend: [
      {
        type: 'plain',
        top: legendRow1Top,
        left: 0,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 3,
        itemGap: 0,
        data: [{ name: names.ynInv!, itemStyle: { color: colors.ynInv } }],
        textStyle: { color: '#475569' },
      },
      {
        type: 'plain',
        top: legendRow1Top,
        left: legendCol2Left,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 3,
        itemGap: 0,
        data: [{ name: names.gzInv!, itemStyle: { color: colors.gzInv } }],
        textStyle: { color: '#475569' },
      },
      {
        type: 'plain',
        top: legendRow2Top,
        left: 0,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 3,
        itemGap: 0,
        data: [{ name: names.ynRun!, itemStyle: { color: colors.ynRun } }],
        textStyle: { color: '#475569' },
      },
      {
        type: 'plain',
        top: legendRow2Top,
        left: legendCol2Left,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 3,
        itemGap: 0,
        data: [{ name: names.gzRun!, itemStyle: { color: colors.gzRun } }],
        textStyle: { color: '#475569' },
      },
    ],

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.replace?.(/^(\d{4})\//, '') ?? v },
    },

    yAxis: [
      {
        type: 'value',
        min: 500,
        max: 3500,
        interval: 500,
        splitLine: { lineStyle: { color: '#EDF2F7' } },
      },
      {
        type: 'value',
        min: 0,
        max: 60,
        interval: 10,
        position: 'right',
        axisLabel: { formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],

    series: [
      // 云南库存（面积叠加）
      {
        name: names.ynInv,
        type: 'line',
        stack: 'inv',
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 0 },
        areaStyle: { color: colors.ynInv, opacity: 0.55 },
        data: ynInv,
        z: 1,
      },
      // 贵州库存（面积叠加）
      {
        name: names.gzInv,
        type: 'line',
        stack: 'inv',
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 0 },
        areaStyle: { color: colors.gzInv, opacity: 0.75 },
        data: gzInv,
        z: 2,
      },
      // 云南开机率（折线）
      {
        name: names.ynRun,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: colors.ynRun,
          shadowColor: 'rgba(111,61,244,0.12)',
          shadowBlur: 2,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
        },
        data: ynRun,
        z: 6,
      },
      // 贵州开机率（折线）
      {
        name: names.gzRun,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: colors.gzRun,
          shadowColor: 'rgba(245,63,63,0.12)',
          shadowBlur: 2,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
        },
        data: gzRun,
        z: 7,
      },
    ],
  };
}
