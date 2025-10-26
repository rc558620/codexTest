import React, { useMemo, useRef } from 'react';
import Nh3Price from '../components/Nh3Price';
import Analysis from '../../Coal/components/Analysis';
import Tendency from '../components/Tendency';
import DesktopMarketPriceAnalysisNew from '../../DesktopMarketPriceAnalysisNew';
import {
  Nh3NationwideContextValue,
  Nh3NationwideDataContext,
} from '../../context/nh3NationwideContext';
import DesktopInterpret, { type DesktopInterpretRef } from '../../DesktopInterpret';
import { isRecord, MobileViewProps, pickCoalBlocks } from '../../typesCopy';
import { useInterpret } from '../../hooks/useInterpret';
import { LoadingOutlined } from '@yth/icons';
import { Spin } from 'antd';
import styles from '../../desktop.module.less';

const Nh3Nationwide: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  const DesktopInterpretRefs = useRef<DesktopInterpretRef>(null);

  const ctxValue: Nh3NationwideContextValue = useMemo(() => {
    const blocks =
      data && isRecord(data.blocks) ? (data.blocks as Record<string, unknown>) : undefined;
    const { eventAnalysis, amnSwPrice, amnCnPrice } = pickCoalBlocks(blocks);

    // 将 region 转换为正确的类型
    const validRegion = region === 'nation' || region === 'xinan' ? region : undefined;

    return {
      dateText: data?.dateText,
      region: validRegion,
      eventAnalysis,
      amnSwPrice,
      amnCnPrice,
    };
  }, [data, region]);

  // 解析 Interpret（深度解读）
  const interpret = useInterpret(
    (data?.blocks ?? undefined) as Record<string, unknown> | undefined,
  );

  // 顶部 MarketPriceAnalysis 卡片数据（已由上层解析注入到 data）
  const priceTitle = data?.priceTitle ?? '';
  const priceRows = data?.priceRows ?? [];

  // loading 简易处理
  if (loading) {
    return (
      <div className={styles.bulkLoading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <Nh3NationwideDataContext.Provider value={ctxValue}>
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
          {/* 合成氨价格走势 */}
          <Nh3Price />
          {/* 西南合成氨价格走势 */}
          <Tendency />
        </div>

        <DesktopInterpret
          ref={DesktopInterpretRefs}
          title={interpret.title}
          items={interpret.items}
        />
      </div>
    </Nh3NationwideDataContext.Provider>
  );
};

export default Nh3Nationwide;
