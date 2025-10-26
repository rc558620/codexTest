// src/pages/Bulk/Nh3/context/nh3NationwideContext.ts
import { createContext, useContext } from 'react';
import type { MajorEventAnalysisProps } from '../AnalysisMobile';

export interface Nh3NationwideContextValue {
  dateText?: string;
  region?: 'nation' | 'xinan';
  // 动态块（按 DataTitle）：
  eventAnalysis?: MajorEventAnalysisProps['blocks']; // 重大事件分析
  dataAnalysis?: unknown; // 深度解读
  amnCnPrice?: unknown; // 全国合成氨价格走势（AmnCnPrice）
  amnSwPrice?: unknown; // 西南合成氨价格走势（AmnSwPrice）
}

export const Nh3NationwideDataContext = createContext<Nh3NationwideContextValue | null>(null);

export const useNh3NationwideData = (): Nh3NationwideContextValue => {
  const ctx = useContext(Nh3NationwideDataContext);
  if (!ctx) return {};
  return ctx;
};
