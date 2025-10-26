import { toParsed } from './parse';
import { getColaData, getNh3Data, getH2so4Data } from '../services/bulk';
import type { ParsedBulkData, RawBulkRow, TabKey } from './types';

interface CacheEntry {
  data?: ParsedBulkData;
  ts: number;
}
const DATA_TTL_MS = 15 * 60 * 1000; // 15 分钟

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
  if (tab === 'coal') {
    res = await getColaData();
  } else if (tab === 'nh3') {
    res = await getNh3Data();
  } else {
    res = await getH2so4Data();
  }
  const rows = (res?.data?.result ?? []) as RawBulkRow[];
  const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : undefined;
  return toParsed(first);
}

export async function getOrFetch(tab: TabKey): Promise<ParsedBulkData | undefined> {
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

// 暴露只读缓存读取给 hook 的初始值
getOrFetch.getCache = getCache;
