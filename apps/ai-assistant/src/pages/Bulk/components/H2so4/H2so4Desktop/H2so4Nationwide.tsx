import React, { useMemo, useRef } from 'react';
import Analysis from '../../Coal/components/Analysis';
import AveragePrice from '../components/AveragePrice';
import { LoadingOutlined } from '@yth/icons';
import { Spin } from 'antd';
import {
  H2so4NationwideContextValue,
  H2so4NationwideDataContext,
} from '../../context/h2so4NationwideContext';
import DesktopMarketPriceAnalysisNew from '../../DesktopMarketPriceAnalysisNew';
import DesktopInterpret, { type DesktopInterpretRef } from '../../DesktopInterpret';
import { isRecord, MobileViewProps, pickCoalBlocks } from '../../typesCopy';
import { useInterpret } from '../../hooks/useInterpret';
import Sour from '../components/Sour';
import SpotPriceYn from '../components/SpotPriceYn';
import styles from '../../desktop.module.less';

const H2so4Nationwide: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  const DesktopInterpretRefs = useRef<DesktopInterpretRef>(null);

  const ctxValue: H2so4NationwideContextValue = useMemo(() => {
    const blocks =
      data && isRecord(data.blocks) ? (data.blocks as Record<string, unknown>) : undefined;
    const { eventAnalysis, slfacCnPrice, slfacYnPrice, slfacSwProd } = pickCoalBlocks(blocks);

    // 将 region 转换为符合 H2so4NationwideContextValue 接口的类型
    const validRegion = region === 'nation' || region === 'yunnanguangxi' ? region : undefined;

    return {
      dateText: data?.dateText,
      region: validRegion,
      eventAnalysis,
      slfacCnPrice,
      slfacYnPrice,
      slfacSwProd,
    };
  }, [data, region]);

  // 解析 Interpret（深度解读）
  const interpret = useInterpret(
    (data?.blocks ?? undefined) as Record<string, unknown> | undefined,
  );

  // 顶部 MarketPriceAnalysis 卡片数据（已由上层解析注入到 data）
  const priceTitle = data?.priceTitle ?? '';
  const priceRows = data?.priceRows ?? [];

  if (loading)
    return (
      <div className={styles.bulkLoading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );

  return (
    <H2so4NationwideDataContext.Provider value={ctxValue}>
      <div className={styles.pageInner}>
        <div className={`${styles.grid} ${styles.grid2}`}>
          <DesktopMarketPriceAnalysisNew
            rows={priceRows}
            priceTitle={priceTitle}
            deepDiveText={interpret.title}
            onDeepDive={() => DesktopInterpretRefs.current?.open()}
          />
          <Analysis
            title="重大事件分析"
            blocks={ctxValue.eventAnalysis}
            verticalMarqueeHeight={196}
          />
        </div>

        <div className={`${styles.grid} ${styles.grid2}`}>
          {/* 全国硫酸价格走势 */}
          <AveragePrice />
          {/* 酸企周产量 */}
          <Sour />
        </div>

        <div className={`${styles.grid} ${styles.grid1}`}>
          {/* 云南硫酸价格走势 */}
          <SpotPriceYn />
        </div>

        <DesktopInterpret
          ref={DesktopInterpretRefs}
          title={interpret.title}
          items={interpret.items}
        />
      </div>
    </H2so4NationwideDataContext.Provider>
  );
};

export default H2so4Nationwide;
