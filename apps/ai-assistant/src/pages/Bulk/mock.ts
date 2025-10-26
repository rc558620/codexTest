// src/mock.ts
import { LineSeries, InventoryRow, makeDates } from '@/components/types';

// src/mock/sadc.ts

/** ---- ECharts Series 类型 ---- */
export interface LinePoint {
  date: string;
  value: number;
}

/** ---- 表格行类型（与你的表格列匹配） ---- */
export interface SaDcpRow {
  key: string;
  日期: string;
  硫酸均价: number;
  '云南硫铁矿（驰宏锌锗）出厂价': number;
  '磷酸氢钙17%': number;
}

/** ---- 日期 ---- */
export const SADC_DATES: string[] = [
  '2024/11/29',
  '2024/12/13',
  '2024/12/27',
  '2025/01/10',
  '2025/01/24',
  '2025/02/07',
  '2025/02/21',
  '2025/03/07',
  '2025/03/21',
  '2025/04/04',
  '2025/04/18',
  '2025/05/02',
  '2025/05/16',
  '2025/05/30',
  '2025/06/13',
  '2025/06/27',
  '2025/07/11',
];

const pts = (values: number[]) => values.map((v, i) => ({ date: SADC_DATES[i], value: v }));

/** ---- 折线数据（与图一致：蓝=磷酸氢钙17%，黄=硫酸均价，红=硫铁矿出厂价） ---- */
export const SADC_PRICE_SERIES: LineSeries[] = [
  {
    name: '磷酸氢钙17%',
    points: pts([
      1700, 1650, 1200, 2000, 2300, 2100, 2600, 2200, 2250, 2350, 2400, 1300, 1200, 1150, 1400,
      1600, 1700,
    ]),
  },
  {
    name: '硫酸均价',
    points: pts([
      2200, 2100, 1500, 1600, 1700, 1500, 1400, 1300, 1400, 1650, 1700, 1200, 1100, 1150, 1300,
      1500, 1600,
    ]),
  },
  {
    name: '云南硫铁矿（驰宏锌锗）出厂价',
    points: pts([
      2700, 2900, 1800, 2100, 2300, 2200, 2400, 2100, 2200, 2300, 2500, 1700, 1800, 2100, 2300,
      2900, 3000,
    ]),
  },
];

/** ---- 表格数据（最近两期） ---- */
export const SADC_PRICE_TABLE: SaDcpRow[] = [
  {
    key: '2025/8/2',
    日期: '2025/8/2',
    硫酸均价: 1600,
    '云南硫铁矿（驰宏锌锗）出厂价': 3000,
    '磷酸氢钙17%': 1700,
  },
  {
    key: '2025/8/1',
    日期: '2025/8/1',
    硫酸均价: 1200,
    '云南硫铁矿（驰宏锌锗）出厂价': 2900,
    '磷酸氢钙17%': 1600,
  },
];

// 云贵 7 个样本价格（图用 & 表格用）
export const DATES_YG_7S = ['2025/8/1', '2025/8/2', '2025/8/3'];

const toPts7s = (vals: number[]) => DATES_YG_7S.map((d, i) => ({ date: d, value: vals[i] }));

export const SERIES_YG_7S = [
  {
    name: '富源雄达煤矿（Q3600）',
    points: toPts7s([320, 300, 340, 310, 330, 350, 380, 360, 300, 280]),
  },
  {
    name: '曲靖园田煤矿（Q4300）',
    points: toPts7s([600, 620, 610, 650, 620, 640, 660, 670, 720, 680]),
  },
  // 下面两条在最后一日做了 +23 / +20，用来给表格“周对比”
  {
    name: '镇雄朱家湾煤矿（Q3800）',
    points: toPts7s([500, 520, 480, 485, 510, 520, 540, 560, 540, 560]),
  },
  {
    name: '筠连金久煤矿（Q4600）',
    points: toPts7s([552, 575, 560, 545, 550, 570, 565, 560, 545, 568]),
  }, // +23
  {
    name: '兴义远程煤矿（Q4000）',
    points: toPts7s([440, 460, 430, 420, 430, 455, 445, 440, 420, 440]),
  }, // +20
  {
    name: '织金大雁煤矿（Q4000）',
    points: toPts7s([900, 880, 860, 910, 850, 930, 960, 920, 990, 910]),
  },
  {
    name: '贵州大方凤凰山煤矿（Q3800）',
    points: toPts7s([880, 920, 900, 950, 930, 980, 1020, 990, 960, 940]),
  },
];

// 表格只展示最近两天
export const TABLE_YG_7S = (() => {
  const idxPrev = DATES_YG_7S.length - 2;
  const idxLast = DATES_YG_7S.length - 1;
  const by = Object.fromEntries(SERIES_YG_7S.map((s) => [s.name, s.points] as const));
  return [
    {
      key: DATES_YG_7S[idxPrev],
      日期: DATES_YG_7S[idxPrev],
      富源雄达煤矿: by['富源雄达煤矿（Q3600）'][idxPrev].value,
      曲靖园田煤矿: by['曲靖园田煤矿（Q4300）'][idxPrev].value,
      镇雄朱家湾煤矿: by['镇雄朱家湾煤矿（Q3800）'][idxPrev].value,
      筠连金久煤矿: by['筠连金久煤矿（Q4600）'][idxPrev].value,
      兴义远程煤矿: by['兴义远程煤矿（Q4000）'][idxPrev].value,
      织金大雁煤矿: by['织金大雁煤矿（Q4000）'][idxPrev].value,
      大方凤凰山煤矿: by['贵州大方凤凰山煤矿（Q3800）'][idxPrev].value,
    },
    {
      key: DATES_YG_7S[idxLast],
      日期: DATES_YG_7S[idxLast],
      富源雄达煤矿: by['富源雄达煤矿（Q3600）'][idxLast].value,
      曲靖园田煤矿: by['曲靖园田煤矿（Q4300）'][idxLast].value,
      镇雄朱家湾煤矿: by['镇雄朱家湾煤矿（Q3800）'][idxLast].value,
      筠连金久煤矿: by['筠连金久煤矿（Q4600）'][idxLast].value,
      兴义远程煤矿: by['兴义远程煤矿（Q4000）'][idxLast].value,
      织金大雁煤矿: by['织金大雁煤矿（Q4000）'][idxLast].value,
      大方凤凰山煤矿: by['贵州大方凤凰山煤矿（Q3800）'][idxLast].value,
    },
  ];
})();

// mock 里新增
export const DATES_PLATE_YG = ['2024/11/03', '2024/11/29', '2024/12/27'];

// 小帮手
const toPts = (vals: number[]) =>
  DATES_PLATE_YG.map((d, i) => ({ date: d, value: vals[i] ?? vals[vals.length - 1] }));

// 5 条曲线（末两天用于“周对比”）
export const PRICE_SERIES_PLATE_YG = [
  {
    name: '镇雄无烟煤Q3600',
    points: toPts([560, 520, 490, 520, 900, 470, 480, 520, 540, 520, 450, 450]),
  },
  {
    name: '织金大雁煤矿无烟煤Q4000',
    // 最后两天 450 → 442（周对比 -8）
    points: toPts([730, 710, 680, 650, 640, 620, 630, 660, 720, 700, 450, 442]),
  },
  {
    name: '富源无烟煤Q5200',
    points: toPts([620, 600, 580, 560, 540, 520, 540, 560, 660, 640, 624, 624]),
  },
  {
    name: '六盘水小河边煤矿无烟煤Q6000',
    points: toPts([540, 510, 500, 490, 480, 500, 520, 560, 640, 600, 840, 840]),
  },
  {
    name: '宣威烟煤Q4800',
    points: toPts([780, 620, 560, 520, 500, 520, 600, 700, 900, 860, 720, 720]),
  },
];

/** 云南及广西 98% 硫酸价格：x 轴日期 */
export const DATES_H2SO4_YNGX: string[] = (() => {
  // 生成 36 周（覆盖 2024/11/29 ~ 2025/8/8）
  const start = new Date('2024-11-29');
  const arr: string[] = [];
  for (let i = 0; i < 36; i += 1) {
    const d = new Date(start.getTime() + i * 7 * 24 * 3600 * 1000);
    arr.push(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`);
  }
  return arr;
})();

/** 五条曲线（与 legend 一一对应） */
export const PRICE_SERIES_H2SO4_YNGX: LineSeries[] = [
  '广西南国铜业 省内到厂价',
  '云南铜业',
  '云锡铜业',
  '曲靖驰宏锌锗',
  '云南均价',
].map((name) => ({
  name,
  points: DATES_H2SO4_YNGX.map((date, i) => {
    // 造型与截图相似的波动（仅占位，接入真实数据时替换）
    let baseValue: number;

    if (name === '广西南国铜业 省内到厂价') {
      baseValue = 1200 + Math.sin(i / 2.3) * 300;
    } else if (name === '云南铜业') {
      baseValue = 1500 + Math.sin(i / 2.6 + 0.6) * 350;
    } else if (name === '云锡铜业') {
      baseValue = 1850 + Math.sin(i / 2.7 + 0.9) * 420;
    } else if (name === '曲靖驰宏锌锗') {
      baseValue = 2100 + Math.sin(i / 2.5 + 0.4) * 380;
    } else {
      baseValue = 1100 + Math.sin(i / 2.2 + 0.2) * 320;
    }

    // 7 月附近制造一个尖峰
    const peakAdjustment = i % 8 === 22 ? 1200 : 0;

    return {
      date,
      value: baseValue + peakAdjustment,
    };
  }),
}));

/** 表格两行 */
export const TABLE_ROWS_H2SO4_YNGX = [
  { key: 'prev', 日期: '2025/8/1', 广西南国: 805, 云南铜业: 750, 云锡铜业: 660, 曲靖驰宏锌锗: 685 },
  { key: 'last', 日期: '2025/8/8', 广西南国: 785, 云南铜业: 720, 云锡铜业: 630, 曲靖驰宏锌锗: 655 },
];

// ✅ 酸企周产量专用日期（避免和已有的 DATES_SALES_SW 冲突）
export const DATES_ACID: string[] = makeDates(1, 12);

// ✅ 堆叠图数据（单位：万吨）——占位数值，接入真实数据时替换
export const SALES_STACK_ACID = [
  {
    name: '威龙化工',
    values: DATES_ACID.map((_, i) => +(0.4 + Math.abs(Math.sin(i / 3)) * 1.2).toFixed(3)),
  },
  {
    name: '西南铜业周产量',
    values: DATES_ACID.map((_, i) => +(1.6 + Math.abs(Math.cos(i / 5)) * 0.9).toFixed(3)),
  },
  {
    name: '易门铜业',
    values: DATES_ACID.map((_, i) => +(0.2 + Math.abs(Math.sin(i / 4 + 0.8)) * 0.7).toFixed(3)),
  },
  {
    name: '云锡铜业',
    values: DATES_ACID.map((_, i) => +(0.5 + Math.abs(Math.cos(i / 4 + 0.2)) * 0.5).toFixed(3)),
  },
  {
    name: '个旧创源',
    values: DATES_ACID.map((_, i) => +(0.25 + Math.abs(Math.sin(i / 6 + 0.4)) * 0.35).toFixed(3)),
  },
  {
    name: '解化化工',
    values: DATES_ACID.map((_, i) => +(0.01 + Math.abs(Math.sin(i / 7)) * 0.03).toFixed(3)),
  },
  {
    name: '文山锌铟',
    values: DATES_ACID.map((_, i) => +(0.6 + Math.abs(Math.cos(i / 8)) * 0.2).toFixed(3)),
  },
];

// ✅ 表格两行（按截图）
export const SALES_TABLE_ACID = [
  {
    key: 'prev',
    日期: '2025/8/1',
    西南铜业周产量: 2.31,
    易门铜业: 0.6,
    威龙化工: 0.875,
    云锡铜业: 0.84,
    个旧创源: 0.84,
    解化化工: 0.028,
    文山锌铟: 0.77,
  },
  {
    key: 'last',
    日期: '2025/8/1',
    西南铜业周产量: 2.31,
    易门铜业: 0.72,
    威龙化工: 1.465,
    云锡铜业: 0.84,
    个旧创源: 0.84,
    解化化工: 0.028,
    文山锌铟: 0.77,
  },
];

// 生成从 2024-02-29 起，按 14 天步长的时间轴（与截图跨度接近）
const genDates = (start: string, n: number, stepDays = 14) => {
  const s = new Date(start).getTime();
  const one = 24 * 3600 * 1000;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(s + i * stepDays * one);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}/${m}/${day}`;
  });
};

// 与图相近的跨度（约 24~26 个点）
export const DATES_SULFUR: string[] = genDates('2024-02-29', 26);

// 3 条曲线：名称按 legend 显示写死
export const PRICE_SERIES_SULFUR: LineSeries[] = [
  '镇江港固体现货价（左轴）',
  'CFR中国现货高端价（右轴），$/吨',
  '硫磺港口库存总量（右轴），万吨',
].map((name) => ({
  name,
  points: DATES_SULFUR.map((date, i) => {
    // 做出与截图相似的走势（占位用）
    if (name.includes('镇江港')) {
      // 人民币价：1200~3000 波动
      const v = 2100 + Math.sin(i / 2.8) * 400 + Math.cos(i / 5) * 180 + (i > 16 ? -250 : 0);
      return { date, value: Math.round(v) };
    }
    if (name.includes('CFR中国')) {
      // 美元价：150~320 波动
      const v = 230 + Math.sin(i / 3.1) * 60 + Math.cos(i / 5.5) * 25 + (i > 16 ? -20 : 0);
      return { date, value: Math.round(v) };
    }
    // 港口库存：50~180 万吨，且在 8~12 处出现一段抬升
    const v = 110 + Math.sin(i / 3.2) * 40 + Math.max(0, 80 - Math.abs(i - 10) * 10);
    return { date, value: Math.max(40, Math.round(v)) };
  }),
}));

// 表格两行（与截图字段/顺序一致）
export const TABLE_ROWS_SULFUR = [
  {
    key: 'prev',
    日期: '2025/8/1',
    港口库存: 247.1, // ✅ 这样与下一行 246.55 相差 0.55
    CFR中国现货高端价_$: 284,
    镇江港固体现货价: 2430,
  },
  {
    key: 'last',
    日期: '2025/8/2',
    港口库存: 246.55,
    CFR中国现货高端价_$: 281,
    镇江港固体现货价: 2370,
  },
];

/** 与图底部刻度一致：从 2024/11/29 起每周一个点，共 36 周 */
export const DATES_SA_DCP: string[] = (() => {
  const start = new Date('2024-11-29');
  const arr: string[] = [];
  for (let i = 0; i < 36; i += 1) {
    const d = new Date(+start + i * 7 * 24 * 3600 * 1000);
    arr.push(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`);
  }
  return arr;
})();

/**
 * 折线两条：
 * - 磷酸氢钙市场均价（蓝）：大致 900~1600 区间，波动较小
 * - 全国98%硫酸均价（含节假日）（黄）：大致 2100~3100，波动稍大，7月附近有一波小峰值
 */
export const PRICE_SERIES_SA_DCP: LineSeries[] = [
  {
    name: '磷酸氢钙市场均价',
    points: DATES_SA_DCP.map((date, i) => {
      // 平滑轻波动，整体 1000~1600 左右
      const v = 1200 + Math.sin(i / 3) * 180 + Math.cos(i / 7) * 90 + (i > 25 && i < 30 ? 80 : 0); // 7 月前后略抬升
      return { date, value: Math.round(v) };
    }),
  },
  {
    name: '全国98%硫酸均价（含节假日）',
    points: DATES_SA_DCP.map((date, i) => {
      // 波动更大，整体 2200~3100，7 月附近略有峰值
      const v =
        2600 + Math.sin(i / 2.8) * 320 + Math.cos(i / 6) * 150 + (i > 24 && i < 30 ? 220 : 0); // 7 月附近小峰
      return { date, value: Math.round(v) };
    }),
  },
];

/** 表格两行（与截图一致） */
export const PRICE_TABLE_SA_DCP = [
  { key: 'row-1', 日期: '2025/8/1', '全国98%硫酸均价': 646, 磷酸氢钙均价: 3054 },
  { key: 'row-2', 日期: '2025/8/2', '全国98%硫酸均价': 635, 磷酸氢钙均价: 3054 },
];

export const DATES: string[] = makeDates(1, 3);
/** 与截图接近的类目轴（稀疏的时间点） */
export const DATES_SALES_SW: string[] = [
  '2024/2/29',
  '2024/3/27',
  '2024/4/1',
  '2024/5/21',
  '2024/6/12',
  '2024/7/11',
  '2024/8/6',
  '2024/9/11',
  '2024/10/12',
  '2024/11/29',
];

/** 堆叠柱：各厂家外销量（吨/天）。这里用函数造型，接数据时替换为真实值即可。 */
const wave = (i: number, a: number, b: number, c = 0) =>
  Math.max(0, a + Math.sin(i / 1.8) * b + Math.cos(i / 2.6) * (b * 0.4) + c);

export const SALES_STACK_SW = [
  {
    name: '云南解化',
    values: DATES_SALES_SW.map((_, i) => Math.round(wave(i, 420, 180, i % 5 === 0 ? 120 : 0))),
  },
  {
    name: '四川泸天化',
    values: DATES_SALES_SW.map((_, i) => Math.round(wave(i, 520, 160, 60))),
  },
  {
    name: '广安玖源',
    values: DATES_SALES_SW.map((_, i) => Math.round(wave(i, 950, 180, 220))), // 主体灰块
  },
  {
    name: '重庆建峰',
    values: DATES_SALES_SW.map((_, i) => Math.round(wave(i, 260, 60, 40))),
  },
  {
    name: '云南越聚',
    values: DATES_SALES_SW.map((_, i) => Math.round(wave(i, 120, 40, 30))), // 顶部小青块
  },
];

/** 表格两行（与截图一致） */
export const SALES_TABLE_SW = [
  {
    key: 'prev',
    日期: '2025/8/1',
    云南解化: 500,
    四川泸天化: 300,
    广安玖源: 450,
    重庆建峰: 100,
    云南越聚: 100,
  },
  {
    key: 'last',
    日期: '2025/8/1',
    云南解化: 214,
    四川泸天化: 300,
    广安玖源: 450,
    重庆建峰: 100,
    云南越聚: 100,
  },
];
/** 五条曲线：云南解化 / 云南越聚 / 四川泸天化 / 四川广安玖源 / 重庆建峰 */
export const PRICE_SERIES_NH3_SW: LineSeries[] = [
  '云南解化',
  '云南越聚',
  '四川泸天化',
  '四川广安玖源',
  '重庆建峰',
].map((name, idx) => ({
  name,
  points: DATES.map((d, i) => ({
    date: d,
    // 简单波动：接入真实数据时替换
    value: 1200 + idx * 250 + Math.sin(i / 1.25 + idx) * 180 + (i % 3) * 60 + (idx === 0 ? 400 : 0),
  })),
}));

/** 表格两行 + 周对比（与截图数值一致；周对比按 “上一行 - 下一行” 计算） */
export const TABLE_ROWS_NH3_SW = [
  {
    key: 'prev',
    日期: '2025/8/1',
    云南解化: 2750,
    云南越聚: 2800,
    四川泸天化: 2450,
    四川广安玖源: 2470,
    重庆建峰: 2600,
  },
  {
    key: 'last',
    日期: '2025/8/8',
    云南解化: 2850, // ↑到 2850 -> 周对比显示 ↓100（按 prev - last 逻辑）
    云南越聚: 2800, // 不变
    四川泸天化: 2450, // 不变
    四川广安玖源: 2430, // ↑40（按 prev - last 逻辑）
    重庆建峰: 2560, // ↑40（与截图匹配）
  },
];
/** ============ 新增：商品氨量/尿素周产量（折线图） ============ */
/** 生成从 2024/11/29 开始，按周递增的日期标签（与图底部时间刻度风格一致） */
const fmtDate = (d: Date) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
export const DATES_OUTPUT: string[] = (() => {
  const start = new Date('2024-11-29');
  const arr: string[] = [];
  // 这里给出 36 周，基本覆盖图中 2024/11/29 ~ 2025/8/8 的跨度
  for (let i = 0; i < 36; i += 1) {
    const d = new Date(+start + i * 7 * 24 * 3600 * 1000);
    arr.push(fmtDate(d));
  }
  return arr;
})();

/** 折线图两条曲线：商品氨量（左轴，~26~31）/ 尿素周产量（右轴，~130~145） */
export const PRICE_SERIES_OUTPUT: LineSeries[] = [
  {
    name: '商品氨量',
    points: DATES_OUTPUT.map((date, i) => ({
      date,
      value: +(27.5 + Math.sin(i / 3) * 2.2 + Math.cos(i / 5) * 0.8).toFixed(2),
    })),
  },
  {
    name: '尿素周产量',
    points: DATES_OUTPUT.map((date, i) => ({
      date,
      value: +(136 + Math.sin(i / 3) * 4.5 + Math.cos(i / 6) * 2.0).toFixed(2),
    })),
  },
];

/** ============ 新增：表格四周区间元数据 + 两行数据 ============ */
export const WEEKS_OUTPUT = [
  { key: 'w29', title: '第29周', range: '7/11-7/17' },
  { key: 'w30', title: '第30周', range: '7/18-7/24' },
  { key: 'w31', title: '第31周', range: '7/25-7/31' },
  { key: 'w32', title: '第32周', range: '8/1-8/7' },
] as const;

/** 表格两行：第一行“商品氨量”的最近 4 周值；第二行“尿素周产量”的最近 4 周值 */
export const OUTPUT_TABLE = [
  {
    key: 'row-goods',
    日期: '2025/8/1',
    w29: 24.46,
    w30: 24.02,
    w31: 24.61,
    w32: 23.09,
  },
  {
    key: 'row-urea',
    日期: '2025/8/2',
    w29: 138.48,
    w30: 135.98,
    w31: 135.95,
    w32: 133.01,
  },
];

// 👉 新增：Trend 用的国际报价曲线（中东FOB / 印度CFR / 坦帕CFR / 中国CFR）
export const PRICE_SERIES_NH3_INTL: LineSeries[] = ['中东FOB', '印度CFR', '坦帕CFR', '中国CFR'].map(
  (name, idx) => ({
    name,
    points: DATES.map((d, i) => ({
      date: d,
      // 占位波动，接入真实数据时替换
      value: 300 + idx * 40 + Math.sin(i / 1.2 + idx) * 35 + (i % 3) * 6,
    })),
  }),
);
// ==== 云贵电厂情况 ====

export const DATES_YG: string[] = makeDates(8, 10); // 与其它图保持一致的日期生成

// 四条：云/贵库存（左轴面积，做堆叠）；云/贵开机率（右轴折线，%）
export const SERIES_YG: LineSeries[] = [
  {
    name: '云南电厂库存',
    points: DATES_YG.map((d, i) => ({
      date: d,
      value: 1100 + Math.sin(i / 1.8) * 120 + (i % 4) * 30, // 占位波动
    })),
  },
  {
    name: '贵州电厂库存',
    points: DATES_YG.map((d, i) => ({
      date: d,
      value: 450 + Math.cos(i / 2.2) * 90 + (i % 5) * 22, // 占位波动
    })),
  },
  {
    name: '云南电厂开机率（%）',
    points: DATES_YG.map((d, i) => ({
      date: d,
      value: +(20 + 6 * Math.sin(i / 2) + (i % 6)).toFixed(2),
    })),
  },
  {
    name: '贵州电厂开机率（%）',
    points: DATES_YG.map((d, i) => ({
      date: d,
      value: +(35 + 5 * Math.cos(i / 2.3) + (i % 7) * 0.3).toFixed(2),
    })),
  },
];

// 顶部两枚胶囊：周环比（总库存、开机率）。开机率为 0 时显示 '—'
export const STATS_YG_SUMMARY = {
  invWow: 3.6, // +3.6
  utilWow: 0, // 显示 '—'
};

// 底部四张卡
export const STATS_YG_LAST = {
  gzInvLast: 1346.87,
  gzRunLast: 58.6,
  ynInvLast: 433.04,
  ynRunLast: 38.46,
};

/** 旧的煤炭系列（若其它页面仍在用，保留为 COAL；不影响本页） */
export const PRICE_SERIES_COAL: LineSeries[] = [
  '全国动力煤均价（Q5500）',
  '全国无烟煤均价',
  '榆林动力块煤（Q6000）',
  '神木烟煤块（Q6500）',
  '秦皇岛动力煤（山西Q5500）',
].map((name, idx) => ({
  name,
  points: DATES.map((d, i) => ({
    date: d,
    value: 520 + idx * 35 + Math.sin(i / 1.3 + idx) * 60 + (i % 3) * 9,
  })),
}));

/** ➕ 新增：合成氨 / 尿素 四条系列，供 Price(NH3) 使用 */
export const PRICE_SERIES_NH3: LineSeries[] = [
  '全国合成氨价格',
  '湖北合成氨均价',
  '西南合成氨均价',
  '全国尿素出厂均价',
].map((name, idx) => ({
  name,
  points: DATES.map((d, i) => ({
    date: d,
    // 随机波动占位：你接入真实数据时替换这里
    value: 1200 + idx * 50 + Math.sin(i / 1.1 + idx) * 80 + (i % 4) * 6,
  })),
}));

/** 其它数据（保持不变） */
export const INVENTORY_STACK: InventoryRow[] = [
  '秦皇岛港',
  '华能曹妃甸港',
  '华电曹妃甸港',
  '曹妃甸港',
  '曹妃甸二期',
  '国投京唐港',
  '京唐老港',
  '京唐36-40港',
].map((name, idx) => ({
  name,
  values: DATES.map((_, i) => 300 + Math.max(0, 120 * Math.sin((i + idx) / 1.8) + 160 + idx * 18)),
}));

export const INVENTORY_MOBLE_STACK: InventoryRow[] = ['秦皇岛港', '华能曹妃甸港', '曹妃甸港'].map(
  (name, idx) => ({
    name,
    values: DATES.map(
      (_, i) => 300 + Math.max(0, 120 * Math.sin((i + idx) / 1.8) + 160 + idx * 18),
    ),
  }),
);

export const PRODUCTION_VALUES = DATES.map((_, i) => 1300 + Math.abs(Math.sin(i / 1.5)) * 950);
export const PRODUCTION_AVG_7D = PRODUCTION_VALUES.map((_, i, arr) => {
  const s = Math.max(0, i - 6);
  const seg = arr.slice(s, i + 1);
  return seg.reduce((a, b) => a + b, 0) / seg.length;
});
