import { useEffect, useState } from 'react';
import { getOrFetch } from '../cache';
import type { ParsedBulkData, TabKey } from '../types';

export function useBulkData(activeTab: TabKey) {
  const [data, setData] = useState<ParsedBulkData | undefined>(() =>
    getOrFetch.getCache(activeTab),
  );
  const [loading, setLoading] = useState<boolean>(() => !getOrFetch.getCache(activeTab));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const cached = getOrFetch.getCache(activeTab);
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
