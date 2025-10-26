/** 基础类型（与 mock/接口对齐） */
export interface LinePoint {
  date: string;
  value: number;
}
export interface LineSeries {
  name: string;
  points: LinePoint[];
}

/** 名称常量（用于匹配/默认顺序/颜色） */
export const INV_NAME = '硫磺港口库存总量（右轴），万吨';
export const ZJ_NAME = '镇江港固体现货价（左轴）';
export const CFR_NAME = 'CFR中国现货高端价（右轴），$/吨';

export const SULFUR_COLOR: Record<string, string> = {
  [INV_NAME]: '#3EE1E9', // 青（面积）
  [ZJ_NAME]: '#0B69C8', // 深蓝（线）
  [CFR_NAME]: '#F53F3F', // 红（线）
};

/** legend 自定义图标 */
export const ICON_ROUND_8 =
  'path://M2 0 H6 A2 2 0 0 1 8 2 V6 A2 2 0 0 1 6 8 H2 A2 2 0 0 1 0 6 V2 A2 2 0 0 1 2 0 Z';
export const ICON_BAR_8x3 =
  'path://M1 2 H7 A1.5 1.5 0 0 1 8.5 3.5 A1.5 1.5 0 0 1 7 5 H1 A1.5 1.5 0 0 1 -0.5 3.5 A1.5 1.5 0 0 1 1 2 Z';

/** 周对比工具（表格可复用；保持你需要的实现方式） */
export const getDirIcon = (dir: 'up' | 'down' | 'flat') => {
  if (dir === 'up') return '▲';
  if (dir === 'down') return '▼';
  return '—';
};

export const toClass = (v: number) => {
  if (v > 0) return 'up';
  if (v < 0) return 'down';
  return 'flat';
};

interface BuildParams {
  dates: string[]; // x 轴类目
  baseSeries: LineSeries[]; // 3 条曲线（来自接口/父组件）
  /** 可选：自定义颜色/名称映射（如果接口名称不同可在这里改） */
  colors?: Record<string, string>;
  names?: { inv?: string; zj?: string; cfr?: string };
  /** 可选：轴范围 */
  yLeft?: { min?: number; max?: number; interval?: number; splitNumber?: number };
  yRight?: { min?: number; max?: number; interval?: number; splitNumber?: number };
}

export function buildSulfurOption({
  dates,
  baseSeries,
  colors = SULFUR_COLOR,
  names = { inv: INV_NAME, zj: ZJ_NAME, cfr: CFR_NAME },
  yLeft = { min: 500, max: 3500, interval: 500, splitNumber: 6 },
  yRight = { min: 0, max: 500, interval: 50, splitNumber: 6 },
}: BuildParams): echarts.EChartsOption {
  // 允许“包含匹配”，更稳（接口名稍有出入也能找到）
  const findByName = (kw: string) => baseSeries.find((s) => s.name === kw || s.name.includes(kw));

  const inv = findByName(names.inv!)!;
  const zj = findByName(names.zj!)!;
  const cfr = findByName(names.cfr!)!;

  return {
    // 不设置顶层 color，避免受 series 顺序影响
    grid: { left: 0, right: 0, top: 56, bottom: 10 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },

    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 18,
      data: [
        { name: names.inv!, icon: ICON_ROUND_8, itemStyle: { color: colors[names.inv!] } },
        { name: names.zj!, icon: ICON_BAR_8x3, itemStyle: { color: colors[names.zj!] } },
        { name: names.cfr!, icon: ICON_BAR_8x3, itemStyle: { color: colors[names.cfr!] } },
      ],
      textStyle: { color: '#475569' },
    },

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.replace(/^(\d{4})\//, '') },
    },

    yAxis: [
      {
        type: 'value',
        min: yLeft.min,
        max: yLeft.max,
        interval: yLeft.interval,
        splitNumber: yLeft.splitNumber,
        splitLine: { lineStyle: { color: '#EDF2F7' } },
      },
      {
        type: 'value',
        position: 'right',
        min: yRight.min,
        max: yRight.max,
        interval: yRight.interval,
        splitNumber: yRight.splitNumber,
        splitLine: { show: false },
        axisLabel: { color: '#64748B' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],

    series: [
      // 左轴：镇江价
      {
        name: zj.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: zj.points.map((p) => p.value),
        lineStyle: {
          width: 3,
          color: colors[names.zj!],
          shadowColor: 'rgba(11,105,200,0.12)',
          shadowBlur: 2,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        },
        itemStyle: { color: colors[names.zj!] },
        z: 10,
      },

      // 右轴：CFR
      {
        name: cfr.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        data: cfr.points.map((p) => p.value),
        lineStyle: {
          width: 3,
          color: colors[names.cfr!],
          shadowColor: 'rgba(245,63,63,0.12)',
          shadowBlur: 2,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        },
        itemStyle: { color: colors[names.cfr!] },
        z: 9,
      },

      // 右轴：库存面积
      {
        name: inv.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        data: inv.points.map((p) => p.value),
        lineStyle: { width: 3, color: colors[names.inv!] },
        itemStyle: { color: colors[names.inv!] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(62,225,233,.25)' },
              { offset: 1, color: 'rgba(62,225,233,0)' },
            ],
          },
        },
        z: 8,
      },
    ],
  };
}
