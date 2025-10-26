// src/pages/Bulk/H2so4/context/h2so4NationwideContext.ts
import { createContext, useContext } from 'react';
import type { MajorEventAnalysisProps } from '../AnalysisMobile';

export interface H2so4NationwideContextValue {
  dateText?: string;
  region?: 'nation' | 'yunnanguangxi';
  eventAnalysis?: MajorEventAnalysisProps['blocks']; // 重大事件分析
  dataAnalysis?: unknown; // 深度解读
  slfacCnPrice?: unknown; // 全国硫酸价格走势（SlfacCnPrice）
  slfacYnPrice?: unknown; // 云南硫酸价格走势（SlfacYnPrice）
  slfacSwProd?: unknown; // 酸企周产量（SlfacSwProd）
}

export const H2so4NationwideDataContext = createContext<H2so4NationwideContextValue | null>(null);

export const useH2so4NationwideData = (): H2so4NationwideContextValue => {
  const ctx = useContext(H2so4NationwideDataContext);
  if (!ctx) return {};
  return ctx;
};
