/** ---------- 子视图通用 Props ---------- */
export interface MobileViewProps {
  data?: ParsedBulkData; // 已统一解析 & 缓存的数据
  loading: boolean;
  region: string;
}

/** ---------- 后端原始返回的一条记录（字段名是动态的） ---------- */
export interface RawBulkRow {
  Date?: string | null;
  [k: string]: unknown; // 其它字段名动态
}

/** ---------- 解析后的统一数据结构 ---------- */
export interface ParsedBulkData {
  /** 原始时间戳文本 */
  dateText?: string;
  /** 价格综述（用于 MarketPriceAnalysis 卡片） */
  priceTitle?: string;
  priceRows?: PriceRow[];
  /** 动态字段解析后的聚合（保持原样放给子视图用） */
  blocks: Record<string, unknown>;
}

export interface PriceRow {
  title: string;
  priceIndex?: string;
  lastAvgPrice: number;
  lastDate?: string;
  lastWoW: number;
  lastTitle?: string;
  lastChain?: string;
  forecastPrice: number;
  forecastWoW: number;
  forecastTitle?: string;
  forecastChain?: string;
  forecastDate?: string;
  unit?: string; // 与MarketPriceAnalysis中的定义保持一致，为可选字段
  disabled?: boolean;
}

export interface AnalysisBlock {
  DataTitle?: string;
  CurrentAnalysis?: AnalysisSection;
  NextAnalysis?: AnalysisSection;
  // 可能还有其它 period 字段，按需扩展
  [k: string]: any;
}

export interface AnalysisSection {
  Class?: string; // “本期消息” / “下期展望”
  SupplyTitle?: string;
  SupplyContent?: string;
  DemandTitle?: string;
  DemandContent?: string;
  OverviewTitle?: string;
  OverviewContent?: string;
}

export interface InterpretItem {
  key: string; // 唯一 key
  className: string; // “本期消息 / 下期展望”
  supplyTitle: string;
  supplyContent: string;
  demandTitle: string;
  demandContent: string;
  overviewTitle: string;
  overviewContent: string;
}

export interface MappedInterpret {
  title: string; // e.g. "深度解读"
  items: InterpretItem[]; // 渲染数组
}

// 重大事件分析块的类型定义
export interface EventAnalysisBlock {
  DataTitle?: string;
  WeeklyNews?: {
    Title?: string; // ← 后端：本周要闻
    Date?: string;
    NewsDetail?: Array<{
      Id?: number | string;
      Date?: string;
      Title?: string;
      Content?: string;
    }>;
  };
  FollowItems?: {
    Class?: string; // ← 后端：后续关注
    FollowItems?: Array<{
      Id?: number | string;
      Date?: string;
      Title?: string;
      Content?: string;
    }>;
  };
}

// src/pages/Bulk/utils/pickByDataTitle.ts
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

export type AnyRec = Record<string, any>;
export type Blocks = Record<string, unknown> | undefined;

/** 和后端约定的稳定块 key（避免魔法字符串散落） */
export const BLOCK_KEYS = {
  // 解析/解读
  dataAnalysis: 'DataAnalysis', // 深度解读（含 CurrentAnalysis / NextAnalysis）
  priceStats: 'PriceStats', // 市场价格分析（卡片）

  // 煤炭 - 价/库/区域/样本等
  cnPrice: 'CokeCnPrice', // 全国煤炭价格走势
  cnStock: 'CokeCnStock', // 八港库存情况
  swPrice: 'CokeSwPrice', // 西南煤炭价格走势
  samplePrices: 'CokeSampPrice', // 西南7个样本价格
  slfacCnPrice: 'SlfacCnPrice', // 全国硫酸价格走势 -> AveragePriceMobile
  slfacYnPrice: 'SlfacYnPrice', // 云南硫酸价格走势 -> SpotPriceYnMobile
  slfacSwProd: 'SlfacSwProd', // 酸企周产量       -> SourMobile
  eventAnalysis: 'EventAnalysis', // 重大事件分析
  amnCnPrice: 'AmnCnPrice',
  amnSwPrice: 'AmnSwPrice',
} as const;

export type BlockKey = (typeof BLOCK_KEYS)[keyof typeof BLOCK_KEYS];

/** 安全地按 key 取块（替代 pickByDataTitle） */
export function pickByBlockKey<T = AnyRec>(blocks: Blocks, key: BlockKey): T | undefined {
  if (!blocks || typeof blocks !== 'object') return undefined;
  const val = (blocks as AnyRec)?.[key];
  return val && typeof val === 'object' ? (val as T) : undefined;
}

/** 批量便捷选择器（可按需使用） */
export function pickCoalBlocks(blocks: Blocks) {
  return {
    eventAnalysis: pickByBlockKey<EventAnalysisBlock>(blocks, BLOCK_KEYS.eventAnalysis),
    dataAnalysis: pickByBlockKey(blocks, BLOCK_KEYS.dataAnalysis),
    priceStats: pickByBlockKey(blocks, BLOCK_KEYS.priceStats),
    cnPrice: pickByBlockKey(blocks, BLOCK_KEYS.cnPrice),
    cnStock: pickByBlockKey(blocks, BLOCK_KEYS.cnStock),
    swPrice: pickByBlockKey(blocks, BLOCK_KEYS.swPrice),
    samplePrices: pickByBlockKey(blocks, BLOCK_KEYS.samplePrices),
    slfacCnPrice: pickByBlockKey(blocks, BLOCK_KEYS.slfacCnPrice),
    slfacYnPrice: pickByBlockKey(blocks, BLOCK_KEYS.slfacYnPrice),
    slfacSwProd: pickByBlockKey(blocks, BLOCK_KEYS.slfacSwProd),
    amnCnPrice: pickByBlockKey(blocks, BLOCK_KEYS.amnCnPrice),
    amnSwPrice: pickByBlockKey(blocks, BLOCK_KEYS.amnSwPrice),
  };
}
