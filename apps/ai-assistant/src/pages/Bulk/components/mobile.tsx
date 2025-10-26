import React, {
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
import { mapDataAnalysis } from './parse';
import { useBulkData } from './hooks/useBulkData';
import { useIdlePrefetch } from './hooks/useIdlePrefetch';
import { TAB_ITEMS, CONFIG } from './MobileConfig';
import type { MobileViewProps, ParsedBulkData, PriceRow, TabKey, RegionByTab } from './types';
import styles from './mobile.module.less';

/**
 * 说明：
 * 1) ActiveView 通过 props 接收数据：<ActiveView data=... loading=... region=... />
 * 2) 数据获取做了模块级缓存（Map）；同一 Tab 只请求一次，15 分钟过期。
 * 3) 解析层对“动态字段名”做了通用处理：遍历后端返回的所有字段，凡是 JSON 字符串一律尝试 parse。
 * 4) 顶部价格卡片从被解析的对象中自动嗅探“市场价格分析”块，无需依赖固定 key。
 * 5) 修复 useEffect 依赖导致的无限请求；清理了 console。
 */

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

  const { interpretTitle, interpretItems } = useMemo(() => {
    const blocks = (data?.blocks ?? {}) as Record<string, unknown>;
    return mapDataAnalysis(blocks);
  }, [data?.blocks]);

  const handleTabChange = useCallback((next: string) => {
    setActiveTab(next as TabKey);
  }, []);

  useEffect(() => {
    if (!options.some((o: { value: string }) => o.value === region)) {
      setRegionByTab((prev) => ({ ...prev, [activeTab]: options[0].value as any }));
    }
  }, [activeTab, options, region]);

  const ActiveView = useMemo(() => {
    const entry = (
      views as Record<
        string,
        { component: React.LazyExoticComponent<ComponentType<MobileViewProps>> } | undefined
      >
    )[region];
    return (entry?.component ?? null) as React.LazyExoticComponent<
      ComponentType<MobileViewProps>
    > | null;
  }, [views, region]);

  return (
    <div className={styles.bulk__mobile}>
      <SegcapsTabs
        items={TAB_ITEMS as readonly SlideSegmentItem[]}
        value={activeTab}
        onChange={handleTabChange}
      />

      {Array.isArray(priceRows) && priceRows.length > 0 && (
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
          <ActiveView data={data as ParsedBulkData | undefined} loading={loading} region={region} />
        </Suspense>
      ) : null}

      {error ? <div className={styles.bulk__error}>加载失败：{error}</div> : null}
    </div>
  );
};
export default Mobile;
