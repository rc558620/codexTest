import React, { useMemo } from 'react';
import type { MobileViewProps } from '../../typesCopy';
import AnalysisMobile from '../../AnalysisMobile';
import PriceMobile from '../components/PriceMobile';
import TendencyMobile from '../components/TendencyMobile';
import { isRecord, pickCoalBlocks } from '../../typesCopy';
import {
  Nh3NationwideDataContext,
  type Nh3NationwideContextValue,
} from '../../context/nh3NationwideContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@yth/icons';
import styles from '../../mobile.module.less';

const Nh3NationwideMobile: React.FC<MobileViewProps> = ({ data, loading, region }) => {
  const ctxValue: Nh3NationwideContextValue = useMemo(() => {
    const blocks =
      data && isRecord(data.blocks) ? (data.blocks as Record<string, unknown>) : undefined;
    const { eventAnalysis, amnSwPrice, amnCnPrice } = pickCoalBlocks(blocks);

    // 仅接受 'nation' | 'xinan'，其余均视为 undefined
    const validRegion = region === 'nation' || region === 'xinan' ? region : undefined;

    return {
      dateText: data?.dateText,
      region: validRegion,
      eventAnalysis,
      amnSwPrice,
      amnCnPrice,
    };
  }, [data, region]);

  if (loading)
    return (
      <div className={styles.bulk_loading}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );

  return (
    <Nh3NationwideDataContext.Provider value={ctxValue}>
      <div className={styles.bulk__mobile__gap}>
        <AnalysisMobile title="重大事件分析" blocks={ctxValue.eventAnalysis} />
        <PriceMobile title="合成氨价格走势" />
        <TendencyMobile title="西南合成氨价格走势" />
      </div>
    </Nh3NationwideDataContext.Provider>
  );
};

export default Nh3NationwideMobile;
