import { createContext, useContext } from 'react';
import { MajorEventAnalysisProps } from '../AnalysisMobile';

/** ===================== 数据上下文 ===================== */
export interface CoalNationwideContextValue {
  dateText?: string;
  region: string;
  // 动态块：保持 unknown，子组件各自断言/校验
  eventAnalysis?: MajorEventAnalysisProps['blocks']; // 重大事件分析
  cnPrice?: unknown; // 全国煤炭价格走势
  cnStock?: unknown; // 八港库存情况
  swPrice?: unknown; // 西南煤炭价格走势
  samplePrices?: unknown; // 西南7个样本价格
}

const CoalNationwideDataContext = createContext<CoalNationwideContextValue | null>(null);

export const useCoalNationwideData = (): CoalNationwideContextValue => {
  const ctx = useContext(CoalNationwideDataContext);
  if (!ctx) {
    throw new Error('useCoalNationwideData must be used within CoalNationwideDataContext.Provider');
  }
  return ctx;
};

export { CoalNationwideDataContext };
