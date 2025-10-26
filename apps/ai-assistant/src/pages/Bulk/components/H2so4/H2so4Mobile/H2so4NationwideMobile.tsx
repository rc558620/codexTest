import React, { useMemo } from 'react';
import type { MobileViewProps } from '../../typesCopy';
import AnalysisMobile from '../../AnalysisMobile';
import AveragePriceMobile from '../components/AveragePriceMobile';
import SourMobile from '../components/SourMobile';
import SpotPriceYnMobile from '../components/SpotPriceYnMobile';
import { isRecord, pickCoalBlocks } from '../../typesCopy';
import {
  H2so4NationwideDataContext,
  type H2so4NationwideContextValue,
} from '../../context/h2so4NationwideContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@yth/icons';
import styles from '../../mobile.module.less';

const H2so4NationwideMobile: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  const ctxValue: H2so4NationwideContextValue = useMemo(() => {
    const blocks =
      data && isRecord(data.blocks) ? (data.blocks as Record<string, unknown>) : undefined;
    const { eventAnalysis, slfacCnPrice, slfacYnPrice, slfacSwProd } = pickCoalBlocks(blocks);

    // 仅接受 'nation' | 'yunnanguangxi'，其余视为 undefined
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

  if (loading) {
    return (
      <div className={styles.bulk_loading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <H2so4NationwideDataContext.Provider value={ctxValue}>
      <div className={styles.bulk__mobile__gap}>
        {/* 重大事件分析 */}
        <AnalysisMobile title="重大事件分析" blocks={ctxValue.eventAnalysis} />
        {/* 全国硫酸价格走势 */}
        <AveragePriceMobile />
        {/* 酸企周产量 */}
        <SourMobile />
        {/* 云南硫酸价格走势 */}
        <SpotPriceYnMobile />
      </div>
    </H2so4NationwideDataContext.Provider>
  );
};

export default H2so4NationwideMobile;
