import { useEffect } from 'react';
import type { TabKey } from '../types';
import { idle } from '../../requestIdle';

export function useIdlePrefetch(
  activeTab: TabKey,
  allViews: Record<TabKey, Record<string, { loader: () => Promise<unknown> }>>,
) {
  useEffect(() => {
    idle(() => {
      (['coal', 'nh3', 'h2so4'] as const)
        .filter((t) => t !== activeTab)
        .forEach((t) => {
          Object.values(allViews[t] || {}).forEach((e) => e?.loader?.());
        });
    });
  }, [activeTab, allViews]);
}
