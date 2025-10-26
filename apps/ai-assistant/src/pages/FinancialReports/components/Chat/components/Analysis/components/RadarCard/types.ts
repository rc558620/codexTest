// types.ts
import type { EChartsCoreOption } from 'echarts/core';

/** ======================== 类型定义 ======================== */
export type RadarKey = 'profit' | 'growth' | 'turnover' | 'cash' | 'debt';

export interface RadarSeriesKV {
  name: string;
  /** 用键值映射，避免轴顺序变化导致值错位 */
  data: Record<RadarKey, number>;
}

export interface RadarAxesItem {
  key: RadarKey;
  title: string; // 轴主标题（如：盈利能力）
  sub: string; // 轴副标题（如：加权净资产ROE）
  max: number;
  min?: number;
}

/** ======================== 颜色常量 ======================== */
const BLUE = '#2F81F7';
const PURPLE = '#7C6AF2';

/** ======================== 轴定义（默认顺序） ========================
 * 盈利能力 → 成长能力 → 运营能力 → 现金获取能力 → 偿债能力
 */
const defaultAxes: RadarAxesItem[] = [
  { key: 'profit', title: '盈利能力', sub: '加权净资产ROE', max: 15, min: 0 },
  { key: 'growth', title: '成长能力', sub: '净利润同比增长率', max: 20, min: -20 }, // 允许为负
  { key: 'turnover', title: '运营能力', sub: '总资产周转率', max: 2, min: 0 },
  { key: 'cash', title: '现金获取能力', sub: '销售现金比率', max: 20, min: 0 },
  { key: 'debt', title: '偿债能力', sub: '流动比率', max: 2, min: 0 },
];

/** ======================== 默认数据（两条序列） ======================== */
export const defaultRadarSeriesKV: RadarSeriesKV[] = [
  {
    name: '2025年中报',
    data: { profit: 11.84, growth: -2.82, turnover: 0.49, cash: 16.82, debt: 0.92 },
  },
  {
    name: '行业均价',
    data: { profit: 4.55, growth: 13.97, turnover: 0.32, cash: 9.34, debt: 1.32 },
  },
];

/** ======================== 小工具 ======================== */
const isPct = (s: string): boolean => /(率|收益率|比率|ROE|毛利|净利)/.test(s);

const fmt = (label: string, v: number): string => {
  if (v == null || Number.isNaN(v)) return '-';
  return isPct(label) ? `${v.toFixed(2)}%` : v.toFixed(2);
};

/** ======================== 主函数：生成 ECharts 配置 ========================
 * @param _unused       兼容旧签名的占位参数（不要删）
 * @param seriesKV      可选，父组件传的两条序列；不传走默认 defaultRadarSeriesKV
 * @param axesOverride  可选，父组件传的轴定义（顺序/最大最小/标题）；不传走 defaultAxes
 */
export const buildRadarOption = (
  _unused?: unknown,
  seriesKV?: RadarSeriesKV[],
  axesOverride?: RadarAxesItem[],
): EChartsCoreOption => {
  const axes = Array.isArray(axesOverride) && axesOverride.length ? axesOverride : [];
  const series = Array.isArray(seriesKV) && seriesKV.length ? seriesKV : [];

  // 1) 把 KV 转成按轴顺序的数组，确保对齐
  const seriesArray = series.map((s) => ({
    name: s.name,
    value: axes.map((ax) => s.data[ax.key]),
  }));

  const blueVals = seriesArray[0]?.value ?? [];
  const purpleVals = seriesArray[1]?.value ?? [];

  // 2) 轴标签：三行富文本 + 蓝/紫数值上色
  const indicator = axes.map((ax, i) => {
    const vBlue = fmt(ax.sub, Number(blueVals[i]));
    const vPurp = fmt(ax.sub, Number(purpleVals[i]));
    let name = `{h|${ax.title}}\n{m|${ax.sub}}\n{b|${vBlue}}  {p|${vPurp}}`;

    // 让“运营能力 / 现金获取能力”的标签稍微外移（在最前面多加换行）
    if (ax.key === 'turnover' || ax.key === 'cash') {
      name = `\n\n${name}`;
    }

    const item: { name: string; max: number; min?: number } = { name, max: ax.max };
    if (typeof ax.min === 'number') item.min = ax.min;
    return item;
  });

  const ringIconPath =
    'path://M7.5,0 A7.5,7.5,0,1,1,7.499,0 Z M7.5,0.01 A7.49,7.49,0,1,0,7.501,0.01 Z';

  // 3) 组装配置
  const option: EChartsCoreOption = {
    backgroundColor: 'transparent',
    color: [BLUE, PURPLE],

    tooltip: { trigger: 'item' },

    /** ---------- 图例：空心圆（有色） + 文本 ---------- */
    legend: {
      bottom: 0,
      left: 'center',
      selectedMode: true,
      // 用奇数尺寸避免半像素抖动
      itemWidth: 11,
      itemHeight: 11,
      itemGap: 20,

      // 未选中置灰（ECharts 会把图标“填充色”统一替换为 inactiveColor）
      inactiveColor: '#B8C0CC',

      // 直接用“环”的 path 图标，不再用描边；颜色就是环色
      data: [
        {
          name: series[0]?.name ?? '2025年中报',
          icon: ringIconPath,
          itemStyle: { color: '#2F81F7' }, // 蓝环
        },
        {
          name: series[1]?.name ?? '行业均价',
          icon: ringIconPath,
          itemStyle: { color: '#7C6AF2' }, // 紫环
        },
      ],
      textStyle: { fontSize: 12, color: '#6b7a90' },
    },

    /** ---------- 雷达网 ---------- */
    radar: {
      center: ['50%', '50%'],
      radius: '50%',
      splitNumber: 5,
      // 内圈虚线（视觉一致）；最外圈我们用“额外序列”画一圈实线
      splitLine: { lineStyle: { type: 'dashed', color: '#e6edf8', width: 1.2 } },
      splitArea: { areaStyle: { color: ['rgba(247,250,255,0.6)', 'rgba(247,250,255,0.35)'] } },
      axisLine: { lineStyle: { color: '#dfe6f2' } },

      axisName: {
        formatter: (v: string): string => v, // 不统一设色，避免覆盖 rich
        rich: {
          h: { fontSize: 14, fontWeight: 500, color: '#1f2937' }, // 主标题
          m: { fontSize: 12, color: '#666' }, // 副标题
          b: { fontSize: 14, fontWeight: 400, color: BLUE }, // 蓝值
          p: { fontSize: 14, fontWeight: 400, color: PURPLE }, // 紫值
        },
        nameGap: 16,
        lineHeight: 20,
      },
      indicator,
    },

    /** ---------- 序列：外圈实线 + 两条数据（无圆点、直线） ---------- */
    series: [
      // 最外层实线圈（用一条静态雷达序列画满各轴 max）
      {
        name: '__outer__',
        type: 'radar',
        silent: true,
        tooltip: { show: false },
        symbol: 'none',
        lineStyle: { color: '#cfd7e6', width: 2, type: 'solid' },
        areaStyle: { opacity: 0 },
        z: 1,
        data: [{ value: axes.map((a) => a.max) }],
      },
      // 蓝/紫两条实际数据（显式给色，保证线条可见；不显示拐点）
      ...seriesArray.map((s, idx) => {
        const color = idx === 0 ? BLUE : PURPLE;
        return {
          name: s.name,
          type: 'radar',
          data: [{ value: s.value, name: s.name }],

          lineStyle: { color, width: 1, opacity: 1 },
          areaStyle: { color, opacity: 0.08 },

          showSymbol: false, // 图上不要点
          smooth: false, // 不要弯曲
          emphasis: { disabled: true },

          // 仅用于图例 marker 的一致性（图上仍无点）
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#fff', borderColor: color, borderWidth: 1 },

          z: 3,
        } as const;
      }),
    ],
  };

  return option;
};
