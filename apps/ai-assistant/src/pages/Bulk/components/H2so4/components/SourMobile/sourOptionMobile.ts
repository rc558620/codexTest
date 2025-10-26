// sourOptionMobile.ts
import type * as echarts from 'echarts';

export interface StackSeries {
  name: string;
  values: number[];
}
export interface LineOverlay {
  name?: string;
  color?: string;
  values?: number[];
}

/** 上/下/平 样式与箭头（给表格汇总行用） */
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

/* ---------- 工具 ---------- */
const hex2rgba = (hex: string, a = 1) => {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};
const makeLinearGradient = (hex: string, topAlpha = 0.22) => ({
  type: 'linear' as const,
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: hex2rgba(hex, topAlpha) },
    { offset: 1, color: hex2rgba(hex, 0) },
  ],
});

// 颜色：按你之前的顺序（不基于名字，而是按顺序取色；名字变也没关系）
const BAR_PALETTE = ['#007FBA', '#89C3E3', '#CFE8FF', '#8DBBFF', '#CDDCFF', '#9ADDFC', '#BBB9F5'];
const LINE_COLOR_DEFAULT = '#9BC6F9';

// 兼容两种入参形态
type BuildParams =
  | {
      // 旧形态（原先写法）
      dates: string[];
      stacks: StackSeries[] | undefined;
      order?: string[];
      colors?: Record<string, string>;
      targetXTicks?: number;
      yDecimals?: number;
      barWidth?: number;
      categoryGap?: string | number;
      gridBg?: string;
      showTotalLine?: boolean;
      totalLine?: LineOverlay;
      legendPerRow?: number;
      lineName?: string; // 可指定哪个是线（可选）
    }
  | {
      // 新形态（组件当前用法）
      dates: string[];
      bars: StackSeries[]; // 只用于柱子
      lineName: string; // 线名
      lineValues: Array<number | null>; // 线数据
      order?: string[];
      colors?: Record<string, string>;
      targetXTicks?: number;
      yDecimals?: number;
      barWidth?: number;
      categoryGap?: string | number;
      gridBg?: string;
      showTotalLine?: boolean; // 对新形态无意义（已提供 lineValues），但保持兼容
      totalLine?: LineOverlay; // 同上
      legendPerRow?: number;
    };

// 从 stacks 中推测线名（若没提供 lineName）
function guessLineName(stacks?: StackSeries[]): string | undefined {
  if (!Array.isArray(stacks) || stacks.length === 0) return undefined;
  // 优先匹配包含“总产量/周度/周产量”的
  const hit =
    stacks.find((s) => /总产量|周度|周产量/.test(s.name)) ?? stacks.find((s) => s.name.length >= 2); // 兜底第一条合理名字
  return hit?.name;
}

// 统一规整成 {bars,lineName,lineValues}
function normalizeInput(input: BuildParams): {
  dates: string[];
  bars: StackSeries[];
  lineName: string;
  lineValues: Array<number | null>;
  order: string[] | undefined;
  colors: Record<string, string> | undefined;
  targetXTicks: number;
  yDecimals: number;
  barWidth: number;
  categoryGap: string | number;
  gridBg: string;
  legendPerRow: number;
} {
  const common = {
    order: (input as any).order as string[] | undefined,
    colors: (input as any).colors as Record<string, string> | undefined,
    targetXTicks: (input as any).targetXTicks ?? 10,
    yDecimals: (input as any).yDecimals ?? 2,
    barWidth: (input as any).barWidth ?? 8,
    categoryGap: (input as any).categoryGap ?? '42%',
    gridBg: (input as any).gridBg ?? '#ffffff',
    legendPerRow: (input as any).legendPerRow ?? 5,
  };

  // 新形态
  if ('bars' in input && 'lineName' in input && 'lineValues' in input) {
    return {
      dates: input.dates ?? [],
      bars: Array.isArray(input.bars) ? input.bars : [],
      lineName: input.lineName,
      lineValues: Array.isArray(input.lineValues) ? input.lineValues : [],
      ...common,
    };
  }

  // 旧形态（把某个 stack 拆成线，其余为柱）
  const stacks = Array.isArray((input as any).stacks)
    ? ((input as any).stacks as StackSeries[])
    : [];
  const dates = (input as any).dates ?? [];
  const lineName = (input as any).lineName ?? guessLineName(stacks) ?? '总产量';
  const line = stacks.find((s) => s.name === lineName);
  const bars = stacks.filter((s) => s.name !== lineName);

  const lineValues: Array<number | null> = Array.isArray(line?.values)
    ? dates.map((_: string, i: number) => {
        const v = line!.values[i];
        return Number.isFinite(v as number) ? (v as number) : null;
      })
    : dates.map(() => null);

  return {
    dates,
    bars,
    lineName,
    lineValues,
    ...common,
  };
}

export function buildSourOption(params: BuildParams): echarts.EChartsOption {
  const {
    dates,
    bars,
    lineName,
    lineValues,
    order,
    colors,
    targetXTicks,
    yDecimals,
    barWidth,
    categoryGap,
    gridBg,
    legendPerRow,
  } = normalizeInput(params);

  const effectiveOrder = Array.isArray(order) && order.length > 0 ? order : bars.map((b) => b.name);

  // x 轴标签稀疏策略
  const step = Math.max(1, Math.ceil((dates?.length ?? 0) / targetXTicks));
  const labelInterval = Math.max(0, step - 1);

  // 颜色：优先用传入的 colors；没有则按顺序从 PALETTE 分配
  const colorMap: Record<string, string> = {};
  effectiveOrder.forEach((name, i) => {
    colorMap[name] = colors?.[name] ?? BAR_PALETTE[i % BAR_PALETTE.length];
  });

  // 柱系列
  const byName = Object.fromEntries(bars.map((s) => [s.name, s] as const));
  const barSeries = effectiveOrder.map((name, idx) => {
    const s = byName[name];
    return {
      name,
      type: 'bar' as const,
      stack: 'total',
      legendHoverLink: false,
      emphasis: { focus: 'series' as const },
      ...(idx === 0 ? { barWidth, barCategoryGap: categoryGap } : {}),
      itemStyle: {
        color: colorMap[name],
        borderColor: gridBg,
        borderWidth: 0,
        borderRadius: 0,
      },
      data: Array.isArray(s?.values)
        ? dates.map((_: string, i: number) => {
            const v = s!.values[i];
            return Number.isFinite(v as number) ? (v as number) : 0;
          })
        : dates.map(() => 0),
      z: 3 + idx,
    };
  });

  // 线系列（名称按入参 lineName；颜色固定用之前的淡蓝）
  const lineColor = LINE_COLOR_DEFAULT;
  const lineSeries: echarts.SeriesOption[] = [
    {
      name: lineName,
      type: 'line',
      smooth: true,
      showSymbol: false,
      yAxisIndex: 0,
      data: Array.isArray(lineValues) ? lineValues : [],
      lineStyle: { width: 2, color: lineColor },
      itemStyle: { color: lineColor },
      areaStyle: { color: makeLinearGradient(lineColor, 0.22) },
      z: 20,
    },
  ];

  // legend：柱子在前，线在最后一个；保留原样式
  const legendNames = [...effectiveOrder, lineName];
  const ROW_H = 22;
  const rows: string[][] = [];
  for (let i = 0; i < legendNames.length; i += legendPerRow) {
    rows.push(legendNames.slice(i, i + legendPerRow));
  }
  const ICON_THIN_8x2 =
    'path://M1 3 H7 A1 1 0 0 1 8 4 A1 1 0 0 1 7 5 H1 A1 1 0 0 1 0 4 A1 1 0 0 1 1 3 Z';
  const legends = rows.map((data, i) => ({
    type: 'plain' as const,
    top: 10 + i * ROW_H,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 10,
    textStyle: { color: '#475569', fontSize: 9 },
    data: data.map((name) =>
      name === lineName
        ? { name, icon: ICON_THIN_8x2, itemStyle: { color: lineColor } }
        : { name, icon: 'roundRect', itemStyle: { color: colorMap[name] } },
    ),
  }));
  const gridTop = 10 + rows.length * ROW_H + 8;

  return {
    grid: {
      left: 0,
      right: 0,
      top: gridTop,
      bottom: 25,
      show: true,
      backgroundColor: gridBg,
      borderWidth: 0,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#E5EEF9',
      borderWidth: 1,
      textStyle: { color: '#0E2540', fontSize: 12 },
      extraCssText:
        'box-shadow:0 6px 18px rgba(21,84,159,0.15);border-radius:8px;padding:8px 10px;',
      formatter: (tooltipParams) => {
        const arr = Array.isArray(tooltipParams) ? tooltipParams : [tooltipParams];
        const name = arr?.[0]?.name ?? '';
        const list = arr
          .map((p) => `<div>${p.marker}${p.seriesName}：${p.data ?? 0}</div>`)
          .join('');
        const total = arr.reduce((a, b) => a + (Number(b.data) || 0), 0);
        return `<div style="margin-bottom:4px;">${name}</div>${list}<div style="margin-top:4px;">合计：${total}</div>`;
      },
    },
    legend: legends,
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: true,
      axisTick: { show: false, alignWithLabel: true },
      axisLine: { show: true, lineStyle: { color: '#E6EEF6' } },
      axisLabel: { interval: labelInterval, fontSize: 9, color: '#7A8A99', margin: 10 },
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        formatter: (v: number) => Number(v).toFixed(yDecimals),
        fontSize: 9,
        color: '#7A8A99',
      },
      splitLine: { lineStyle: { color: '#E8F2FB' } },
      splitNumber: 8,
      min(value) {
        return Math.floor(value.min);
      },
      max(value) {
        return Math.ceil(value.max);
      },
    },
    series: [...barSeries, ...lineSeries],
  };
}
