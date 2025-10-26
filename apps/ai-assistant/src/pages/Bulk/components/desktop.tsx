import React, { Suspense, useCallback, useEffect, useMemo, useState, ComponentType } from 'react';
import styles from './desktop.module.less';
import DesktopTabs, { type DesktopTabsItem } from './DesktopTabs';
import { CONFIG, TAB_ITEMS } from './DesktopConfig';
import type { ComponentViewProps, ParsedBulkData, TabKey, RegionByTab } from './types';
import { useBulkData } from './hooks/useBulkData';
import { useIdlePrefetch } from './hooks/useIdlePrefetch';

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

  // 仅预取其它区域视图 chunk，不请求接口
  useIdlePrefetch(activeTab, {
    coal: CONFIG.coal.views,
    nh3: CONFIG.nh3.views,
    h2so4: CONFIG.h2so4.views,
  } as any);

  const handleTabChange = useCallback((next: string) => setActiveTab(next as TabKey), []);
  const setRegion = useCallback(
    (next: string) => setRegionByTab((prev) => ({ ...prev, [activeTab]: next as any })),
    [activeTab],
  );

  // 区域有效性守护
  useEffect(() => {
    if (!options.some((o) => o?.value === region)) {
      setRegion(options[0]?.value);
    }
  }, [options, region, setRegion]);

  // 选择当前区域 Desktop 视图
  const ActiveView = useMemo(() => {
    const entry = (
      views as Record<
        string,
        { component: React.LazyExoticComponent<ComponentType<ComponentViewProps>> } | undefined
      >
    )[region];
    return (entry?.component ?? null) as React.LazyExoticComponent<
      ComponentType<ComponentViewProps>
    > | null;
  }, [views, region]);

  return (
    <div className={styles.page}>
      <div className={styles.page__top}>
        <DesktopTabs
          items={TAB_ITEMS as readonly DesktopTabsItem[]}
          value={activeTab}
          onChange={handleTabChange}
        />
      </div>

      <div className={styles.page__inners}>
        <Suspense fallback={''}>
          {ActiveView ? (
            <ActiveView
              data={data as ParsedBulkData | undefined}
              loading={loading}
              region={region}
            />
          ) : null}
        </Suspense>
        {error ? <div className={styles.error}>加载失败：{error}</div> : null}
      </div>
    </div>
  );
};

export default Desktop;
