// src/pages/Bulk/components/Production/buildYgOption.ts
import type { EChartsOption } from 'echarts';

export interface YgOptionParams {
  dates: string[];
  ynInv: number[];
  gzInv: number[];
  ynRun: number[];
  gzRun: number[];
  names?: {
    ynInv?: string;
    gzInv?: string;
    ynRun?: string;
    gzRun?: string;
  };
  colors?: {
    ynInv?: string;
    gzInv?: string;
    ynRun?: string;
    gzRun?: string;
  };
  legendCol2Left?: number; // 兼容旧入参（不再使用）
  legendRow1Top?: number; // 兼容旧入参（不再使用）
  legendRow2Top?: number; // 兼容旧入参（不再使用）
}

export const clsWow = (v?: number | null) => {
  if (!v) return 'flat';
  return v > 0 ? 'up' : 'down';
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
}: YgOptionParams): EChartsOption {
  const axisText = '#64748B';
  const gridLine = '#EDF2F7';

  // 用更短的显示文案（不改 series 的 name，只改变 legend 里展示）
  const legendFormatter = (name: string) => name.replace('电厂', '').replace('（%）', '%'); // “云南库存 / 贵州库存 / 云南开机率% / 贵州开机率%”

  return {
    grid: { left: 0, right: 0, top: 70, bottom: 6 },
    tooltip: { trigger: 'axis', confine: true },

    // ✅ 单行 legend：占满宽度（left+right），居中对齐；字体 9；必要时用 scroll 保持一行
    legend: {
      type: 'scroll', // 关键：不再换行，宽度不够会分页/滚动，仍保持单行
      orient: 'horizontal',
      left: 'center',
      right: 0,
      top: 3,
      align: 'auto',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10, // 收紧间距帮助 4 项并排
      textStyle: { color: '#475569', fontSize: 9 },
      formatter: legendFormatter, // 使用短文案
      data: [
        { name: names.ynInv, itemStyle: { color: colors.ynInv } },
        { name: names.gzInv, itemStyle: { color: colors.gzInv } },
        { name: names.ynRun, itemStyle: { color: colors.ynRun } },
        { name: names.gzRun, itemStyle: { color: colors.gzRun } },
      ],
      // 可选：隐藏分页箭头的样式（想完全不显示可以透明化）
      // pageIconColor: 'transparent',
      // pageIconInactiveColor: 'transparent',
      // pageTextStyle: { color: 'transparent' },
    },

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => v.replace?.(/^(\d{4})\//, '') ?? v, // 显示 M/D
        fontSize: 9, // ✅ 字体 9
        color: axisText,
        margin: 12,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },

    yAxis: [
      {
        type: 'value',
        min: 500,
        max: 3500,
        interval: 500,
        axisLabel: { fontSize: 9, color: axisText }, // ✅ 字体 9
        splitLine: { lineStyle: { color: gridLine } },
      },
      {
        type: 'value',
        min: 0,
        max: 60,
        interval: 10,
        position: 'right',
        axisLabel: { formatter: '{value}%', fontSize: 9, color: axisText }, // ✅ 字体 9
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],

    series: [
      // 面积：云南库存
      {
        name: names.ynInv,
        type: 'line',
        stack: 'inv',
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 0 },
        itemStyle: { color: colors.ynInv },
        areaStyle: { color: colors.ynInv, opacity: 0.55 },
        data: ynInv,
        z: 1,
      },
      // 面积：贵州库存
      {
        name: names.gzInv,
        type: 'line',
        stack: 'inv',
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 0 },
        itemStyle: { color: colors.gzInv },
        areaStyle: { color: colors.gzInv, opacity: 0.75 },
        data: gzInv,
        z: 2,
      },
      // 折线：云南开机率
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
      // 折线：贵州开机率
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
