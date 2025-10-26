import { DatasetPreview } from './components/Home/components/DatasetPreview/types';
import { DatasetInfo, NavItem, RecentDialog } from './types';

import {
  RadarIndicator,
  RadarSeries,
  MetricsItem,
  AnalysisBlock,
} from './components/Chat/components/Analysis/index';
import { MetricItem } from './components/Chat/components/Analysis/types';
import {
  RadarAxesItem,
  RadarKey,
  RadarSeriesKV,
} from './components/Chat/components/Analysis/components/RadarCard/types';

export const mockNav: NavItem[] = [
  { key: 'agent-qa', label: 'Agent相关知识' },
  { key: '写作相关技巧', label: '写作相关技巧' },
  { key: '描述性统计', label: '描述性统计' },
  { key: 'dTrade', label: 'dTrade产品设计快览' },
  { key: '交易平台统计', label: '交易平台统计&集成分析' },
  { key: 'more', label: '查看更多 >' },
];

export const mockRecent: RecentDialog[] = [
  { key: 'r1', title: 'Agent相关知识' },
  { key: 'r2', title: '写作相关技巧' },
  { key: 'r3', title: '描述性统计' },
  { key: 'r4', title: 'dTrade产品设计快览' },
  { key: 'r5', title: '交易平台统计&集成分析' },
];

export const mockDataset: DatasetInfo = {
  name: '云天化财务数据集',
  tags: ['资产负债', '利润', '现金流量', '所有者权益变动'],
  authed: true,
  abilities: ['财务分析', '对标分析'],
};

export const mockPreview: DatasetPreview = {
  datasetName: '云天化财务主表',
  recommendedQueries: ['今年经营活动现金流出小计', '取得投资收益收到的现金', '本月营业总收入'],
  fields: [
    {
      name: '公司(维度)',
      code: 'company',
      dataType: '文本',
      desc: '指标在公司层面的表现',
    },
    {
      name: '总营业收入(原子指标)',
      code: 'totaloperating revenue',
      dataType: '数值',
      desc: '指企业经营主营业务和其他业务所确认的收入总额',
    },
  ],
};

export const indicators: RadarIndicator[] = [
  { name: '盈利能力', max: 15 },
  { name: '成长能力', max: 5 },
  { name: '运营能力', max: 5 },
  { name: '现金获取能力', max: 5 },
  { name: '偿债能力', max: 3 },
];

export const series: RadarSeries[] = [
  { name: '2025年中报', value: [11.84, -2.82, 0.38, 0.49, 0.92] },
  { name: '行业均值', value: [4.55, -3.12, 0.12, 0.36, 1.32] },
];

export const mockMetrics: MetricItem[] = [
  {
    key: 'profit',
    title: '盈利能力',
    subtitle: '加权净资产收益率ROE',
    valueBlue: 11.84,
    valuePurple: 4.55,
  },
  {
    key: 'growth',
    title: '成长能力',
    subtitle: '净利润同比增长率',
    valueBlue: -2.82,
    valuePurple: 13.97,
  },
  {
    key: 'turnover',
    title: '运营能力',
    subtitle: '总资产周转率',
    valueBlue: 0.49,
    valuePurple: 0.32,
  },
  {
    key: 'cash',
    title: '现金获取能力',
    subtitle: '销售现金比率',
    valueBlue: 16.82,
    valuePurple: 9.34,
  },
  { key: 'debt', title: '偿债能力', subtitle: '流动比率', valueBlue: 0.92, valuePurple: 1.32 },
];

export const paragraphs: AnalysisBlock[] = [
  {
    title: '一、盈利能力',
    summary: '盈利能力高于行业，但需求走弱和价格波动（如磷氨、煤炭）对毛利率的拖压仍在。',
    bullets: [
      '云天化的盈利能力在行业中表现突出，主要体现在净资产收益率（ROE）和销售净利率的提升。',
      '预计 2025 年中报 ROE：11.84%，高于行业均值 4.55%；受益于公司费用控制和效率改善，盈利韧性强。',
      '短期看，原材料价格波动与需求修复不均衡仍会带来扰动。',
    ],
  },
  {
    title: '二、偿债能力',
    summary: '',
    bullets: [
      '公司偿债能力在行业中居于中游，流动性总体稳健。',
      '资产负债率 2025 年中报约 51.58%；关注到期债务结构优化节奏。',
    ],
  },
  {
    title: '三、成长能力',
    summary: '成长性阶段性承压，等待下游需求修复。',
    bullets: [
      '净利润同比略降，行业均值亦走弱，主要受部分产品价格回落和需求偏弱影响。',
      '中长期看，项目投产与成本优化是提升成长性的关键抓手。',
    ],
  },
  {
    title: '四、运营能力',
    summary: '',
    bullets: ['总资产周转率稳定提升，反映公司资产利用效率较好，供应链与产销协同优化。'],
  },
  {
    title: '五、现金获取能力',
    summary: '',
    bullets: ['销售现金比率平稳，现金回款表现正常，对营运有正向支撑。'],
  },
];

export const RadarCardData: RadarSeriesKV[] = [
  {
    name: '2025年中报',
    data: {
      profit: 11.84,
      growth: -2.82,
      turnover: 0.49,
      cash: 16.82,
      debt: 0.92,
    } satisfies Record<RadarKey, number>,
  },
  {
    name: '行业均价',
    data: { profit: 4.55, growth: 13.97, turnover: 0.32, cash: 9.34, debt: 1.32 } satisfies Record<
      RadarKey,
      number
    >,
  },
];

export const RadarCardAxes: RadarAxesItem[] = [
  { key: 'profit', title: '盈利能力', sub: '加权净资产ROE', max: 15, min: 0 },
  { key: 'growth', title: '成长能力', sub: '净利润同比增长率', max: 20, min: -20 },
  { key: 'turnover', title: '运营能力', sub: '总资产周转率', max: 2, min: 0 },
  { key: 'cash', title: '现金获取能力', sub: '销售现金比率', max: 20, min: 0 },
  { key: 'debt', title: '偿债能力', sub: '流动比率', max: 2, min: 0 },
];
