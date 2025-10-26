// src/pages/Bulk/Desktop/index.tsx
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ComponentType,
} from 'react';
import './desktop.less';
import DesktopTabs, { DesktopTabsItem } from './DesktopTabs';

import { transformToPriceRows } from '../types';
import { getColaData, getNh3Data, getH2so4Data } from '../services/bulk';
import { ParsedBulkData, RawBulkRow } from './typesCopy';

/** ========== Tabs ========== */
const TAB_ITEMS: readonly DesktopTabsItem[] = [
  { key: 'coal', label: '煤炭' },
  { key: 'nh3', label: '合成氨' },
  { key: 'h2so4', label: '硫酸' },
] as const;

type TabKey = 'coal' | 'nh3' | 'h2so4';
type CoalRegionKey = 'nation' | 'yungui';
type Nh3RegionKey = 'nation' | 'xinan';
type H2so4RegionKey = 'nation' | 'yunnanguangxi';

interface RegionByTab {
  coal: CoalRegionKey;
  nh3: Nh3RegionKey;
  h2so4: H2so4RegionKey;
}

type Option<T extends string> = Readonly<{ label: string; value: T }>;
type Loader = () => Promise<{ default: ComponentType<any> }>;
const makeView = (loader: Loader) => ({ loader, component: lazy(loader) });

/** ========== JSON 解析（与 Mobile 共用） ========== */
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

/** 将首条记录解析为 ParsedBulkData，并嗅探“市场价格分析”生成 priceTitle / priceRows */
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
  let priceRows: ParsedBulkData['priceRows'] | undefined;

  if (candidate) {
    const { dataTitle, priceRowsArray } = transformToPriceRows(candidate);
    priceTitle = dataTitle ?? '';
    priceRows = priceRowsArray ?? [];
  }

  return {
    dateText: (row.Date ?? undefined) as string | undefined,
    priceTitle,
    priceRows,
    blocks,
  };
}

/** ========== 模块级缓存/去重（与 Mobile 共用） ========== */
interface CacheEntry {
  data?: ParsedBulkData;
  ts: number;
}
const DATA_TTL_MS = 15 * 60 * 1000;
const bulkCache: Map<TabKey, CacheEntry> = new Map();
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

async function fetchBulk(tab: TabKey): Promise<ParsedBulkData | undefined> {
  let res: any;
  if (tab === 'coal') res = await getColaData();
  else if (tab === 'nh3') res = await getNh3Data();
  else res = await getH2so4Data();

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

/** ========== 数据 Hook ========== */
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

/** ========== 视图配置（区域值与 Mobile 保持一致） ========== */
const CONFIG = {
  coal: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云贵', value: 'yungui' },
    ] as const satisfies ReadonlyArray<Option<CoalRegionKey>>,
    views: {
      nation: makeView(() => import('./Coal/CoalDesktop/CoalNationwide')),
      yungui: makeView(() => import('./Coal/CoalDesktop/CoalYunGui')),
    } as const,
  },
  nh3: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '西南', value: 'xinan' },
    ] as const satisfies ReadonlyArray<Option<Nh3RegionKey>>,
    views: {
      nation: makeView(() => import('./Nh3/Nh3Desktop/Nh3Nationwide')),
      xinan: makeView(() => import('./Nh3/Nh3Desktop/Nh3XiNan')),
    } as const,
  },
  h2so4: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云南及广西', value: 'yunnanguangxi' },
    ] as const satisfies ReadonlyArray<Option<H2so4RegionKey>>,
    views: {
      nation: makeView(() => import('./H2so4/H2so4Desktop/H2so4Nationwide')),
      yunnanguangxi: makeView(() => import('./H2so4/H2so4Desktop/H2so4YunNanGuangXi')),
    } as const,
  },
} as const;

/** 空闲预取（仅预取 chunk，不请求接口） */
function useIdlePrefetch(activeTab: TabKey) {
  const { options, views } = CONFIG[activeTab] as any;
  useEffect(() => {
    const idle = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 250);

    idle(() => {
      options.map((o: any) => o.value).forEach((v: string) => views[v]?.loader?.());
    });
  }, [activeTab, options, views]);
}

const Desktop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('coal');
  const [regionByTab, setRegionByTab] = useState<RegionByTab>({
    coal: 'nation',
    nh3: 'nation',
    h2so4: 'nation',
  });

  const { data, loading, error } = useBulkData(activeTab);

  const { options, views } = CONFIG[activeTab];
  const region = regionByTab[activeTab];

  /** 预取其它区域视图 */
  useIdlePrefetch(activeTab);

  /** Tab & 区域切换 */
  const handleTabChange = useCallback((next: string) => setActiveTab(next as TabKey), []);
  const setRegion = useCallback(
    (next: string) => setRegionByTab((prev) => ({ ...prev, [activeTab]: next as any })),
    [activeTab],
  );

  /** 区域有效性守护 */
  useEffect(() => {
    if (!options.some((o) => o.value === region)) {
      setRegion(options[0].value);
    }
  }, [options, region, setRegion]);

  /** 选择当前区域 Desktop 视图 */
  const ActiveView = useMemo(() => {
    const entry = (views as any)[region];
    return (entry?.component ?? null) as React.LazyExoticComponent<ComponentType<any>> | null;
  }, [views, region]);

  return (
    <div className="page">
      <div className="page__top">
        <DesktopTabs items={TAB_ITEMS} value={activeTab} onChange={handleTabChange} />
      </div>

      <div className="page__inners">
        <Suspense fallback={''}>
          {ActiveView ? <ActiveView data={data} loading={loading} region={region} /> : null}
        </Suspense>
        {error ? <div className="error">加载失败：{error}</div> : null}
      </div>
    </div>
  );
};

export default Desktop;
