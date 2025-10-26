import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ComponentType,
} from 'react';
import SegcapsTabs, { type SlideSegmentItem } from './SegcapsTabs';
import MarketPriceAnalysis from './MarketPriceAnalysis';
import Interpret, { type InterpretRef } from './Interpret';
import { transformToPriceRows } from '../types';
import { getColaData, getNh3Data, getH2so4Data } from '../services/bulk';
import type { MobileViewProps, ParsedBulkData, RawBulkRow, PriceRow } from './typesCopy';
import './mobile.less';

/**
 * ===================== 说明 =====================
 * 1) ActiveView 通过 props 接收数据：<ActiveView data=... loading=... region=... />
 * 2) 数据获取做了模块级缓存（Map）；同一 Tab 只请求一次，15 分钟过期。
 * 3) 解析层对“动态字段名”做了通用处理：遍历后端返回的所有字段，凡是 JSON 字符串一律尝试 parse。
 * 4) 顶部价格卡片从被解析的对象中自动嗅探“市场价格分析”块，无需依赖固定 key。
 * 5) 修复 useEffect 依赖导致的无限请求；清理了 console。
 * =================================================
 */

/** ---------- 类型 ---------- */
export type TabKey = 'coal' | 'nh3' | 'h2so4';
export type CoalRegionKey = 'nation' | 'yungui';
export type Nh3RegionKey = 'nation' | 'xinan';
export type H2so4RegionKey = 'nation' | 'yunnanguangxi';

interface RegionByTab {
  coal: CoalRegionKey;
  nh3: Nh3RegionKey;
  h2so4: H2so4RegionKey;
}

type Option<T extends string> = Readonly<{ label: string; value: T }>;

type Loader<P = any> = () => Promise<{ default: ComponentType<P> }>;
const makeView = <P,>(loader: Loader<P>) => ({
  loader,
  component: lazy(loader),
});

/** ---------- 顶部大类 Tab ---------- */
const TAB_ITEMS: readonly SlideSegmentItem[] = [
  { key: 'coal', label: '煤炭' },
  { key: 'nh3', label: '合成氨' },
  { key: 'h2so4', label: '硫酸' },
] as const;

/** ---------- JSON 工具 ---------- */
const looksLikeJson = (s: string): boolean => {
  const t = s.trim();
  return (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'));
};

function safeParse<T>(input: string): T | undefined {
  try {
    return JSON.parse(input) as T;
  } catch {
    return undefined;
  }
}

/**
 * 将 RawBulkRow 解析为 ParsedBulkData：
 * - 遍历所有字段；凡是 string 且像 JSON 就 parse
 * - 其它类型保持不动，汇总到 blocks 里
 * - 从所有 blocks 中嗅探“市场价格分析”以生成 priceTitle 与 priceRows
 */
function toParsed(row?: RawBulkRow): ParsedBulkData | undefined {
  if (!row) return undefined;

  const blocks: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, val]) => {
    if (key === 'Date') return;
    if (typeof val === 'string' && looksLikeJson(val)) {
      const parsed = safeParse<unknown>(val);
      blocks[key] = parsed !== undefined ? parsed : val;
    } else {
      blocks[key] = val as unknown;
    }
  });

  const candidate = Object.values(blocks).find((v) => {
    if (!v || typeof v !== 'object') return false;
    const obj = v as Record<string, unknown>;
    const dt = String((obj as any).DataTitle ?? '');
    const hasTypical = 'CnTherma' in obj || 'CnAnthra' in obj;
    return dt.includes('市场价格分析') || hasTypical;
  }) as Record<string, unknown> | undefined;

  let priceTitle: string | undefined;
  let priceRows: PriceRow[] | undefined;
  if (candidate) {
    const { dataTitle, priceRowsArray } = transformToPriceRows(candidate);
    priceTitle = (dataTitle ?? '') as string;
    priceRows = (priceRowsArray ?? []) as PriceRow[];
  }

  const parsed: ParsedBulkData = {
    dateText: (row.Date ?? undefined) as string | undefined,
    priceTitle,
    priceRows,
    blocks,
  };
  return parsed;
}

/** ---------- 模块级缓存 ---------- */
interface CacheEntry {
  data?: ParsedBulkData;
  ts: number;
}
const DATA_TTL_MS = 15 * 60 * 1000; // 15 分钟
const bulkCache: Map<TabKey, CacheEntry> = new Map();

// 进行中请求去重
const inflight: Map<TabKey, Promise<ParsedBulkData | undefined>> = new Map();

function getCache(tab: TabKey): ParsedBulkData | undefined {
  const hit = bulkCache.get(tab);
  if (!hit) return undefined;
  if (Date.now() - hit.ts > DATA_TTL_MS) {
    bulkCache.delete(tab);
    return undefined;
  }
  return hit.data;
}
function setCache(tab: TabKey, data: ParsedBulkData | undefined): void {
  bulkCache.set(tab, { data, ts: Date.now() });
}

/** ---------- 实际拉取（按 Tab 调各自接口） ---------- */
async function fetchBulk(tab: TabKey): Promise<ParsedBulkData | undefined> {
  let res: any;
  if (tab === 'coal') {
    res = await getColaData();
  } else if (tab === 'nh3') {
    res = await getNh3Data();
  } else {
    res = await getH2so4Data();
  }
  const rows = (res?.data?.result ?? []) as RawBulkRow[];
  const first = rows.length > 0 ? rows[0] : undefined;
  return toParsed(first);
}

async function getOrFetch(tab: TabKey): Promise<ParsedBulkData | undefined> {
  const cached = getCache(tab);
  if (cached) return cached;

  const pending = inflight.get(tab);
  if (pending) return pending;

  const p = fetchBulk(tab)
    .then((data) => {
      setCache(tab, data);
      inflight.delete(tab);
      return data;
    })
    .catch((err) => {
      inflight.delete(tab);
      throw err;
    });

  inflight.set(tab, p);
  return p;
}

/** ---------- 数据获取 Hook ---------- */
function useBulkData(activeTab: TabKey) {
  const [data, setData] = useState<ParsedBulkData | undefined>(() => getCache(activeTab));
  const [loading, setLoading] = useState<boolean>(() => !getCache(activeTab));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const cached = getCache(activeTab);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getOrFetch(activeTab)
      .then((parsed) => {
        if (!alive) return;
        setData(parsed);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message ?? '加载失败');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeTab]);

  return { data, loading, error } as const;
}

/** ---------- 空闲时预取其它 Tab 的视图 + 数据 ---------- */
function useIdlePrefetch(
  activeTab: TabKey,
  allViews: Record<TabKey, Record<string, ReturnType<typeof makeView<any>>>>,
) {
  useEffect(() => {
    const idle = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 250);

    idle(() => {
      (['coal', 'nh3', 'h2so4'] as const)
        .filter((t) => t !== activeTab)
        .forEach((t) => {
          // 仅预取视图 chunk，不拉接口数据
          Object.values(allViews[t] || {}).forEach((e) => e?.loader?.());
        });
    });
  }, [activeTab, allViews]);
}

/** ---------- 配置：每个 Tab 的区域项 + 视图 ---------- */
const CONFIG = {
  coal: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云贵', value: 'yungui' },
    ] as const satisfies ReadonlyArray<Option<CoalRegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./Coal/CoalMobile/CoalMobileNationwide')),
      yungui: makeView<MobileViewProps>(() => import('./Coal/CoalMobile/CoalMobileYunGui')),
    },
  },
  nh3: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '西南', value: 'xinan' },
    ] as const satisfies ReadonlyArray<Option<Nh3RegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./Nh3/Nh3Mobile/Nh3NationwideMobile')),
      xinan: makeView<MobileViewProps>(() => import('./Nh3/Nh3Mobile/Nh3XiNanMobile')),
    },
  },
  h2so4: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云南及广西', value: 'yunnanguangxi' },
    ] as const satisfies ReadonlyArray<Option<H2so4RegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./H2so4/H2so4Mobile/H2so4NationwideMobile')),
      yunnanguangxi: makeView<MobileViewProps>(
        () => import('./H2so4/H2so4Mobile/H2so4YunNanGuangXiMobile'),
      ),
    },
  },
} as const;

/** ============= 这里开始：把 DataAnalysis 映射到 Interpret 所需结构（就地实现） ============= */

/** 卡片项（与 Interpret/WeeklyNewsCard 结构一致；TS 采用结构化类型，跨文件无需同名导入） */
export interface WeeklyNewsItem {
  key: string; // 'CurrentAnalysis' | 'NextAnalysis' | ...
  class: string; // 后端 Class（本期消息/下期展望）
  supplyTitle: string;
  supplyContent: string;
  demandTitle: string;
  demandContent: string;
  costTitle: string;
  costContent: string;
  overviewTitle: string;
  overviewContent: string;
}

/** 容错取字符串 */
const toStr = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

/** 将单个节点映射为 WeeklyNewsItem */
function mapNodeToItem(key: string, node: any): WeeklyNewsItem {
  const nd = node && typeof node === 'object' ? (node as Record<string, unknown>) : {};
  return {
    key,
    class: toStr(nd.Class, ''),
    supplyTitle: toStr(nd.SupplyTitle, ''),
    supplyContent: toStr(nd.SupplyContent, ''),
    demandTitle: toStr(nd.DemandTitle, ''),
    demandContent: toStr(nd.DemandContent, ''),
    costTitle: toStr(nd.CostTitle, ''),
    costContent: toStr(nd.CostContent, ''),
    overviewTitle: toStr(nd.OverviewTitle, ''),
    overviewContent: toStr(nd.OverviewContent, ''),
  };
}

/** 把 data.blocks.DataAnalysis → { title, items[] } */
function mapDataAnalysis(blocks?: Record<string, unknown>): {
  interpretTitle: string;
  interpretItems: WeeklyNewsItem[];
} {
  const da = blocks?.DataAnalysis as any;
  if (!da || typeof da !== 'object') return { interpretTitle: '', interpretItems: [] };

  const title = toStr(da.DataTitle, '');
  const items: WeeklyNewsItem[] = [];

  if (da.CurrentAnalysis && typeof da.CurrentAnalysis === 'object') {
    items.push(mapNodeToItem('CurrentAnalysis', da.CurrentAnalysis));
  }
  if (da.NextAnalysis && typeof da.NextAnalysis === 'object') {
    items.push(mapNodeToItem('NextAnalysis', da.NextAnalysis));
  }

  // 若后续还有其它段落，这里按需追加：
  // if (da.OtherAnalysis) items.push(mapNodeToItem('OtherAnalysis', da.OtherAnalysis));

  return { interpretTitle: title, interpretItems: items };
}

/** ---------- 组件 ---------- */
const Mobile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('coal');
  const [priceRows, setPriceRows] = useState<PriceRow[]>([]);
  const [priceRowsTitle, setPriceRowsTitle] = useState<string>('');

  const [regionByTab, setRegionByTab] = useState<RegionByTab>({
    coal: 'nation',
    nh3: 'nation',
    h2so4: 'nation',
  });

  const interpretRef = useRef<InterpretRef>(null);

  const { options, views } = CONFIG[activeTab];
  const region = regionByTab[activeTab];

  useIdlePrefetch(activeTab, {
    coal: CONFIG.coal.views,
    nh3: CONFIG.nh3.views,
    h2so4: CONFIG.h2so4.views,
  });

  const { data, loading, error } = useBulkData(activeTab);

  useEffect(() => {
    setPriceRowsTitle(data?.priceTitle ?? '');
    setPriceRows(data?.priceRows ?? []);
  }, [data]);

  // —— 在 Mobile 内就把 DataAnalysis 规范化 —— //
  const { interpretTitle, interpretItems } = useMemo(() => {
    const blocks = (data?.blocks ?? {}) as Record<string, unknown>;
    return mapDataAnalysis(blocks);
  }, [data?.blocks]);

  const handleTabChange = useCallback((next: string) => {
    setActiveTab(next as TabKey);
  }, []);

  useEffect(() => {
    if (!options.some((o) => o.value === region)) {
      setRegionByTab((prev) => ({ ...prev, [activeTab]: options[0].value as any }));
    }
  }, [activeTab, options, region]);

  const ActiveView = useMemo(() => {
    const entry = (views as Record<string, ReturnType<typeof makeView<MobileViewProps>>>)[region];
    return (entry?.component ?? null) as React.LazyExoticComponent<
      ComponentType<MobileViewProps>
    > | null;
  }, [views, region]);

  return (
    <div className="bulk__mobile">
      <SegcapsTabs items={TAB_ITEMS} value={activeTab} onChange={handleTabChange} />

      {priceRows?.length > 0 && (
        <MarketPriceAnalysis
          title={priceRowsTitle}
          deepDiveText={interpretTitle}
          rows={priceRows}
          onDeepDive={() => interpretRef.current?.open()}
        />
      )}

      <Interpret ref={interpretRef} title={interpretTitle} items={interpretItems} />

      {ActiveView ? (
        <Suspense fallback={''}>
          <ActiveView data={data} loading={loading} region={region} />
        </Suspense>
      ) : null}

      {error ? <div className="error">加载失败：{error}</div> : null}
    </div>
  );
};

export default Mobile;
