import React, { useMemo } from 'react';
import AnalysisMobile from '../../AnalysisMobile';
import PriceMobile from '../components/PriceMobile';
import InventoryMobile from '../components/InventoryMobile';
import YgBoardPriceMobile from '../components/YgBoardPriceMobile';
import YgSamplePricesMobile from '../components/YgSamplePricesMobile';
import { isRecord, pickCoalBlocks, type MobileViewProps } from '../../typesCopy';
import { CoalNationwideDataContext } from '../../context/coalNationwideContext';
import type { CoalNationwideContextValue } from '../../context/coalNationwideContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@yth/icons';
import styles from '../../mobile.module.less';

/**
 * CoalNationwide（移动端）
 * 使用 CSS Modules 的 styles 引用形式
 */
const CoalNationwide: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  // 将 useMemo 放在组件顶部，避免在条件语句中调用 Hook
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
    };
  }, [data, region]);

  // loading 状态
  if (loading) {
    return (
      <div className={styles.bulkLoading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <CoalNationwideDataContext.Provider value={ctxValue}>
      <div className={styles.bulkMobileGap}>
        <AnalysisMobile title="重大事件分析" blocks={ctxValue.eventAnalysis} />
        <PriceMobile title="全国煤炭价格走势" />
        <InventoryMobile title="八港库存情况" />
        <YgBoardPriceMobile title="西南煤炭价格走势" />
        <YgSamplePricesMobile title="西南7个样本价格" />
      </div>
    </CoalNationwideDataContext.Provider>
  );
};

export default CoalNationwide;
