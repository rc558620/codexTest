// nh3IntlOption.ts
// 负责构建“国际合成氨价格”折线图的 ECharts 配置

export interface Point {
  date: string;
  value: number;
}
export interface LineSeries {
  name: string;
  points: Point[];
}

export const NH3_INTL_COLOR: Record<string, string> = {
  中东FOB: '#007FBA',
  印度CFR: '#00B42A',
  坦帕CFR: '#F53F3F',
  中国CFR: '#F7BA1E',
};

/** 小工具：方向图标（表格环比用） */
export const getDirectionIcon = (direction: string): string => {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '—';
};

/** 生成 echarts option —— 只依赖入参，父组件传数据即可实时更新 */
export function buildNh3IntlOption({
  dates,
  baseSeries,
}: {
  dates: string[];
  baseSeries: LineSeries[];
}): echarts.EChartsOption {
  const series = baseSeries.map((s) => {
    const color = NH3_INTL_COLOR[s.name] ?? '#64748B';
    return {
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data: s.points.map((p) => p.value),
      itemStyle: { color },
      lineStyle: { width: 2, color },
      emphasis: { focus: 'series' as const },
      zlevel: 0,
      z: 0,
    };
  });

  return {
    grid: { left: 0, right: 0, top: 50, bottom: 0 },
    tooltip: { trigger: 'axis' },
    legend: [
      {
        type: 'plain',
        top: 9,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 2,
        itemGap: 16,
        data: baseSeries.map((s) => s.name),
        textStyle: { color: '#475569' },
      },
    ],
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { formatter: (v: string) => v.slice(5) },
      boundaryGap: false, // 线图左右撑满
    },
    yAxis: { type: 'value' },
    series,
  };
}
