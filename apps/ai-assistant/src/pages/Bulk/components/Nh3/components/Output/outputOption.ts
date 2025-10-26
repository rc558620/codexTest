// outputOption.ts
// “商品氨量/尿素周产量”折线图的配置构建器，只依赖入参

export interface Point {
  date: string;
  value: number;
}
export interface LineSeries {
  name: string;
  points: Point[];
}

// 颜色 & 固定顺序（保持和你现有一致）
export const OUTPUT_COLOR: Record<string, string> = {
  商品氨量: '#007FBA',
  尿素周产量: '#F7BA1E',
};
export const OUTPUT_ORDER = ['商品氨量', '尿素周产量'] as const;

interface AxisCfg {
  min?: number;
  max?: number;
  splitNumber?: number;
}
/** 上/下/平图标 */
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

export function buildOutputOption({
  dates,
  baseSeries,
  yLeft = { min: 20, max: 50, splitNumber: 6 },
  yRight = { min: 90, max: 150, splitNumber: 6 },
}: {
  dates: string[];
  baseSeries: LineSeries[];
  yLeft?: AxisCfg;
  yRight?: AxisCfg;
}): echarts.EChartsOption {
  const byName = Object.fromEntries(baseSeries.map((s) => [s.name, s] as const));

  const series = (OUTPUT_ORDER as readonly string[])
    .filter((name) => byName[name]) // 防御：只渲染传入里存在的系列
    .map((name) => {
      const s = byName[name]!;
      const color = OUTPUT_COLOR[name] || '#64748B';
      return {
        name,
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        // 左轴=商品氨量；右轴=尿素周产量（保持和你原配置一致）
        yAxisIndex: name === '商品氨量' ? 0 : 1,
        data: s.points.map((p) => p.value),
        itemStyle: { color },
        lineStyle: {
          width: 4,
          color,
          shadowColor: name === '商品氨量' ? 'rgba(0,127,186,0.3)' : 'rgba(247, 186, 30, 0.4)',
          shadowBlur: 3,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        },
        z: name === '商品氨量' ? 10 : 9,
      };
    });

  return {
    color: (OUTPUT_ORDER as readonly string[]).filter((n) => byName[n]).map((n) => OUTPUT_COLOR[n]),

    grid: { left: 0, right: 0, top: 53, bottom: 4 },
    tooltip: { trigger: 'axis' },

    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 2,
      itemGap: 20,
      data: (OUTPUT_ORDER as readonly string[]).filter((n) => byName[n]),
      textStyle: { color: '#475569' },
    },

    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.replace(/^(\d{4})\//, '') },
    },

    yAxis: [
      { type: 'value', ...yLeft }, // 左轴：商品氨量
      {
        type: 'value',
        ...yRight,
        position: 'right',
        axisLine: { show: false },
      }, // 右轴：尿素周产量
    ],

    series,
  };
}
