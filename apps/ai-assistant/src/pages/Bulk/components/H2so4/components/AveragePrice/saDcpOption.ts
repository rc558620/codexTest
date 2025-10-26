import type { EChartsOption } from 'echarts';

export interface Point {
  date: string;
  value: number | null; // 允许 null 以断线
}
export interface LineSeries {
  name: string;
  points: Point[];
}

/** PALETTE：严格顺序取色 */
const PALETTE = [
  '#007FBA',
  '#F7BA1E',
  '#2FC3FF',
  '#2B74FF',
  '#7B61FF',
  '#00B42A',
  '#34D399',
  '#F7BA1E',
  '#F59E0B',
  '#F53F3F',
  '#EF6C6C',
  '#9AA0A6',
  '#722ED1',
  '#13C2C2',
  '#3B82F6',
  '#8B5CF6',
  '#06B6D4',
];

const colorAt = (i: number, name: string, colorMap?: Record<string, string>): string => {
  if (colorMap && colorMap[name]) return colorMap[name];
  return PALETTE[i % PALETTE.length];
};

/** 上/下/平图标与类名（表格复用需要） */
export const icon = (diff: number) => {
  if (diff > 0) return '▲';
  if (diff < 0) return '▼';
  return '—';
};

export const dirClass = (diff: number) => {
  if (diff > 0) return 'up';
  if (diff < 0) return 'down';
  return 'flat';
};

export function buildSaDcpOption({
  dates,
  baseSeries,
  hideRightAxis = true,
  colorMap,
}: {
  dates: string[];
  baseSeries: LineSeries[];
  hideRightAxis?: boolean;
  colorMap?: Record<string, string>;
}): EChartsOption {
  // 只有一个系列时，隐藏右轴
  const needRightAxis = !hideRightAxis && baseSeries.length > 1;

  // 系列：顺序取色；第1条用左轴(0)，第2条用右轴(1)
  const series = baseSeries.map((s, i) => {
    const color = colorAt(i, s.name, colorMap);
    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      yAxisIndex: needRightAxis && i > 0 ? 1 : 0,
      data: s.points.map((p) => p.value),
      itemStyle: { color },
      lineStyle: {
        width: 2,
        color,
        // shadowColor: `${color}66`,
        // shadowBlur: 2,
        // shadowOffsetX: 5,
        // shadowOffsetY: 5,
      },
      connectNulls: false,
      z: i === 0 ? 10 : 9,
    };
  });

  return {
    grid: { left: 0, right: 0, top: 51, bottom: 35 },
    tooltip: { trigger: 'axis' },
    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 2,
      itemGap: 16,
      data: baseSeries.map((s) => s.name),
      textStyle: { color: '#475569' },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.replace(/^(\d{4})\//, '') : v),
      },
    },
    yAxis: [
      {
        type: 'value',
        splitNumber: 6,
        splitLine: { lineStyle: { color: '#EDF2F7' } },
      },
      {
        type: 'value',
        position: 'right',
        show: needRightAxis,
        axisLabel: { show: needRightAxis },
        axisTick: { show: needRightAxis },
        axisLine: { show: needRightAxis },
        splitLine: { show: needRightAxis },
        splitNumber: 8,
        min(value) {
          return Math.floor(value.min);
        },
        max(value) {
          return Math.ceil(value.max);
        },
      },
    ],
    series,
  };
}
