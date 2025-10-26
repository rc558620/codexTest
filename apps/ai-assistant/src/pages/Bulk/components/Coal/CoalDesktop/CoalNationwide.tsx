// src/pages/Bulk/Desktop/Coal/CoalDesktop/CoalNationwide.tsx
import React, { useMemo, useRef } from 'react';
import Price from '../components/Price';
import Inventory from '../components/Inventory';
import Analysis from '../components/Analysis';
import YgBoardPrice from '../components/YgBoardPrice';
import YgSamplePrices from '../components/YgSamplePrices';
import DesktopMarketPriceAnalysisNew from '../../DesktopMarketPriceAnalysisNew';
import DesktopInterpret, { type DesktopInterpretRef } from '../../DesktopInterpret';
import { isRecord, pickCoalBlocks, type MobileViewProps } from '../../typesCopy';
import { CoalNationwideDataContext } from '../../context/coalNationwideContext';
import type { CoalNationwideContextValue } from '../../context/coalNationwideContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@yth/icons';
import { useInterpret } from '../../hooks/useInterpret';
import styles from '../../desktop.module.less';
import { cx } from '@/utils/utils';

const CoalNationwide: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  const DesktopInterpretRefs = useRef<DesktopInterpretRef>(null);

  // 统一上下文（价/库/区域/样本等块）
  const ctxValue: CoalNationwideContextValue = useMemo(() => {
    const blocks =
      data && isRecord(data.blocks) ? (data.blocks as Record<string, unknown>) : undefined;
    const { eventAnalysis, cnPrice, cnStock, swPrice, samplePrices } = pickCoalBlocks(blocks);
    return {
      dateText: data?.dateText,
      region,
      eventAnalysis,
      cnPrice,
      cnStock,
      swPrice,
      samplePrices,
      // 如果后面也想给 Analysis 用深度解读，可把 dataAnalysis 也塞进来
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
      <div className={styles.bulk_loading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <CoalNationwideDataContext.Provider value={ctxValue}>
      <div className={styles.page__inner}>
        {/* 第一行：桌面版“市场价格分析”卡 + 重大事件 */}
        <div className={cx(styles.grid, styles['grid--2'])}>
          <DesktopMarketPriceAnalysisNew
            rows={priceRows}
            priceTitle={priceTitle}
            deepDiveText={interpret.title}
            onDeepDive={() => DesktopInterpretRefs.current?.open()}
          />
          <Analysis
            title="重大事件分析"
            blocks={ctxValue.eventAnalysis}
            verticalMarqueeHeight={332}
          />
        </div>

        {/* 第二行：价格 & 库存 */}
        <div className={cx(styles.grid, styles['grid--2'])}>
          {/* 全国煤炭价格走势 */}
          <Price />
          {/* 八港库存情况 */}
          <Inventory />
        </div>

        {/* 第三行：西南走势 & 样本价 */}
        <div className={cx(styles.grid, styles['grid--2'])}>
          {/* 西南煤炭价格走势 */}
          <YgBoardPrice />
          {/* 西南7个样本价格 */}
          <YgSamplePrices />
        </div>

        <DesktopInterpret
          ref={DesktopInterpretRefs}
          title={interpret.title}
          items={interpret.items}
        />
      </div>
    </CoalNationwideDataContext.Provider>
  );
};

export default CoalNationwide;
