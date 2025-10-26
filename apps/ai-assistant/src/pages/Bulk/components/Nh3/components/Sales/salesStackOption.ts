export interface StackBarSeries {
  name: string;
  values: number[];
}

export const DEFAULT_SALES_COLOR: Record<string, string> = {
  云南解化: '#007FBA', // 蓝
  四川泸天化: '#F7BA1E', // 黄
  广安玖源: '#DCE3EA', // 灰
  重庆建峰: '#00B42A', // 绿
  云南越聚: '#1EF7F7', // 青
};

interface BuildParams {
  dates: string[];
  stackSeries: StackBarSeries[]; // 堆叠数据（父组件/接口传入）
  colors?: Record<string, string>; // 可覆写颜色
  order?: string[]; // 可指定堆叠顺序（下→上）
  gridBg?: string; // 背景色，用来做“缝”的描边
  barWidth?: number | string; // 柱宽
  barCategoryGap?: number | string; // 类目间距
}

export function buildSalesStackOption({
  dates,
  stackSeries,
  colors = DEFAULT_SALES_COLOR,
  order,
  gridBg = '#ffffff',
  barWidth = 18,
  barCategoryGap = '42%',
}: BuildParams): echarts.EChartsOption {
  // 有显式顺序就用；否则按传入数据的顺序
  const effOrder = (order && order.length ? order : stackSeries.map((s) => s.name)) as string[];

  const series = effOrder.map((name, idx) => {
    const s = stackSeries.find((x) => x.name === name);
    const color = colors[name] ?? '#94a3b8';

    return {
      name,
      type: 'bar' as const,
      stack: 'total',
      emphasis: { focus: 'series' as const },
      ...(idx === 0 ? { barWidth, barCategoryGap } : {}),
      itemStyle: {
        color,
        borderColor: gridBg, // 用 grid 底色做描边 → 形成“缝”
        borderWidth: 1,
        // 顶/底轻圆角（中间层无圆角，避免露角）
        borderRadius: 2,
      },
      data: s?.values ?? [],
      z: 3 + idx,
    };
  });

  return {
    grid: {
      left: 48,
      right: 24,
      top: 64,
      bottom: 30,
      show: true, // 必须显示 grid，描边才能“吃”到底色
      backgroundColor: gridBg,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        // 确保 params 是数组类型
        const paramsArray = Array.isArray(params) ? params : [params];
        const name = paramsArray?.[0]?.name ?? '';
        const list = paramsArray
          .map((p) => `<div>${p.marker}${p.seriesName}：${p.data ?? 0}</div>`)
          .join('');
        const total = paramsArray.reduce((a, b) => a + (Number(b.data) || 0), 0);
        return `<div style="margin-bottom:4px;">${name}</div>${list}<div style="margin-top:4px;">合计：${total}</div>`;
      },
    },
    legend: {
      type: 'plain',
      top: 10,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 18,
      data: effOrder,
      textStyle: { color: '#475569' },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: true,
      axisTick: { alignWithLabel: true },
      axisLabel: { interval: 0 }, // 每个刻度都显示
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#EDF2F7' } },
    },
    series,
  };
}
/** 上/下/平 样式与箭头（周对比一行用） */
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
