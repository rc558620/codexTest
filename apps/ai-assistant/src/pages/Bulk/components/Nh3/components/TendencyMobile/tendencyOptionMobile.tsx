// src/pages/Bulk/components/Nh3/components/tendencyOptionMobile.ts
import type { EChartsOption } from 'echarts';

export interface Point {
  date: string;
  value: number | null; // 用 null 断线
}
export interface LineSeries {
  name: string;
  points: Point[];
}

/** 上/下/平 样式与箭头（供表格 summary 用） */
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

/** ===== 动态配色（无位运算，规避 eslint no-bitwise） ===== */
const PALETTE = [
  '#007FBA',
  '#00B42A',
  '#F53F3F',
  '#F7BA1E',
  '#722ED1',
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

/** ===== 颜色分配函数 ===== */
function colorAt(index: number, name: string, colorMap?: Record<string, string>): string {
  // 如果 colorMap 中有指定颜色，则优先使用
  if (colorMap?.[name]) {
    return colorMap[name];
  }
  // 否则按顺序使用 PALETTE 中的颜色
  return PALETTE[index % PALETTE.length];
}

export function buildTendencyOption({
  dates,
  baseSeries,
  colorMap,
  markAtRatio = 0.62,
}: {
  dates: string[];
  baseSeries: LineSeries[];
  colorMap?: Record<string, string>;
  markAtRatio?: number;
}): EChartsOption {
  const idxRaw = Math.round(dates.length * markAtRatio);
  const labelIdx = Math.max(0, Math.min(dates.length - 1, idxRaw));

  const series = baseSeries.map((s, i) => {
    const color = colorAt(i, s.name, colorMap);
    const data = s.points.map((p) => p.value); // number | null
    const labelValue = data[labelIdx];
    const hasLabel = typeof labelValue === 'number' && Number.isFinite(labelValue);

    const cfg: any = {
      name: s.name,
      type: 'line',
      smooth: true,
      smoothMonotone: 'x',
      showSymbol: false,
      data,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      connectNulls: false,
      z: 2,
    };

    if (hasLabel) {
      cfg.markPoint = {
        symbol: 'circle',
        symbolSize: 10,
        tooltip: { show: false },
        zlevel: 1,
        z: 100,
        data: [
          {
            coord: [labelIdx, labelValue],
            value: labelValue,
            itemStyle: {
              color,
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: `${color}66`,
              shadowBlur: 6,
            },
            label: {
              show: true,
              formatter: '{b}',
              color,
              padding: [0, 6],
              borderRadius: 4,
              position: 'bottom',
              offset: [0, 0],
              fontSize: 8,
            },
            name: s.name,
          },
        ],
      };
    }

    return cfg;
  });

  return {
    grid: { left: 0, right: 0, top: 37, bottom: 10 },
    tooltip: { trigger: 'axis' },
    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 2,
      itemGap: 10,
      data: baseSeries.map((s) => s.name),
      textStyle: { color: '#475569', fontSize: 9 },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (typeof v === 'string' ? v.slice(5) : v),
        fontSize: 9,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 9 },
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
