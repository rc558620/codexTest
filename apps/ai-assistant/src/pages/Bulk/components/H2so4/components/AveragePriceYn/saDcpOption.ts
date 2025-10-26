// ---- types ----
export interface LinePoint {
  date: string;
  value: number;
}
export interface LineSeries {
  name: string;
  points: LinePoint[];
}

// ---- names & colors ----
export const DCP_NAME = '磷酸氢钙17%';
export const SA_NAME = '硫酸均价';
export const PYRITE_NAME = '云南硫铁矿（驰宏锌锗）出厂价';

export const COLOR: Record<string, string> = {
  [DCP_NAME]: '#007FBA', // 蓝（左轴）
  [SA_NAME]: '#F7BA1E', // 黄（左轴）
  [PYRITE_NAME]: '#F53F3F', // 红（右轴）
};

// 上/下/平（表格用）
/** 上/下/平图标与类名 */
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

interface BuildParams {
  dates: string[];
  baseSeries: LineSeries[]; // 3 条
  hideRightAxis?: boolean; // 是否隐藏右轴（默认 false：右轴可见）
  colors?: Record<string, string>;
  names?: { dcp?: string; sa?: string; pyrite?: string };
  yLeft?: { min?: number; max?: number; interval?: number; splitNumber?: number };
  yRight?: { min?: number; max?: number; interval?: number; splitNumber?: number };
}

// ---- echarts option ----
export function buildSaDcpOption({
  dates,
  baseSeries,
  hideRightAxis = false, // ✅ 按设计图默认显示右轴
  colors = COLOR,
  names = { dcp: DCP_NAME, sa: SA_NAME, pyrite: PYRITE_NAME },
  // 左轴区间（参考稿面）
  yLeft = { min: 500, max: 3500, interval: 500, splitNumber: 6 },
  // 右轴区间（参考稿面：0~6000）
  yRight = { min: 0, max: 6000, interval: 1000, splitNumber: 6 },
}: BuildParams): echarts.EChartsOption {
  const pick = (kw: string) => baseSeries.find((s) => s.name === kw || s.name.includes(kw))!;

  const dcp = pick(names.dcp!);
  const sa = pick(names.sa!);
  const pyrite = pick(names.pyrite!);

  return {
    grid: { left: 0, right: 0, top: 56, bottom: 6 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },

    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 2,
      itemGap: 18,
      data: [names.dcp!, names.sa!, names.pyrite!],
      textStyle: { color: '#475569' },
    },

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => v.replace(/^(\d{4})\//, ''), // 显示 M/D
        color: '#64748B',
        margin: 12,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },

    yAxis: [
      // 左轴（磷酸氢钙17%、硫酸均价）
      {
        type: 'value',
        min: yLeft.min,
        max: yLeft.max,
        interval: yLeft.interval,
        splitNumber: yLeft.splitNumber,
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#EDF2F7' } },
      },
      // 右轴（硫铁矿）
      {
        type: 'value',
        position: 'right',
        min: yRight.min,
        max: yRight.max,
        interval: yRight.interval,
        splitNumber: yRight.splitNumber,
        show: !hideRightAxis,
        axisLabel: { show: !hideRightAxis, color: '#64748B' },
        axisTick: { show: !hideRightAxis },
        axisLine: {
          show: !hideRightAxis,
          lineStyle: {
            color: '#F7BA1E', // 👈 你想要的轴线颜色，比如和左轴一致
          },
        },
        splitLine: { show: false },
      },
    ],

    series: [
      {
        name: dcp.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: dcp.points.map((p) => p.value),
        itemStyle: { color: colors[names.dcp!] },
        lineStyle: {
          width: 3,
          color: colors[names.dcp!],
          // shadowColor: 'rgba(0,127,186,0.20)',
          // shadowBlur: 2,
          // shadowOffsetX: 4,
          // shadowOffsetY: 4,
        },
        z: 10,
      },
      {
        name: sa.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: sa.points.map((p) => p.value),
        itemStyle: { color: colors[names.sa!] },
        lineStyle: {
          width: 3,
          color: colors[names.sa!],
          // shadowColor: 'rgba(247,186,30,0.25)',
          // shadowBlur: 2,
          // shadowOffsetX: 4,
          // shadowOffsetY: 4,
        },
        z: 9,
      },
      {
        name: pyrite.name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1, // ✅ 使用右轴
        data: pyrite.points.map((p) => p.value),
        itemStyle: { color: colors[names.pyrite!] },
        lineStyle: {
          width: 3,
          color: colors[names.pyrite!],
          // shadowColor: 'rgba(245,63,63,0.25)',
          // shadowBlur: 2,
          // shadowOffsetX: 4,
          // shadowOffsetY: 4,
        },
        z: 8,
      },
    ],
  };
}
