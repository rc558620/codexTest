// src/pages/Bulk/hooks/useInterpret.ts
import { useMemo } from 'react';

type AnyRec = Record<string, any>;

export interface InterpretItem {
  key: string;
  className: string;
  supplyTitle: string;
  supplyContent: string;
  demandTitle: string;
  demandContent: string;
  overviewTitle: string;
  overviewContent: string;
  // ★ 新增
  costTitle?: string;
  costContent?: string;
}

export interface UseInterpretResult {
  title: string; // DataTitle，如“深度解读”
  items: InterpretItem[]; // 解析后的数组
}

const toStr = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

const mapNode = (key: string, node: unknown): InterpretItem => {
  const nd = node && typeof node === 'object' ? (node as AnyRec) : {};
  return {
    key,
    className: toStr(nd.Class, ''),
    supplyTitle: toStr(nd.SupplyTitle, ''),
    supplyContent: toStr(nd.SupplyContent, ''),
    demandTitle: toStr(nd.DemandTitle, ''),
    demandContent: toStr(nd.DemandContent, ''),
    overviewTitle: toStr(nd.OverviewTitle, ''),
    overviewContent: toStr(nd.OverviewContent, ''),
    costTitle: toStr(nd.CostTitle, ''),
    costContent: toStr(nd.CostContent, ''),
  };
};

/**
 * 从 blocks.DataAnalysis 中提取 Interpret 所需结构
 * @param blocks 统一解析后的 blocks（ParsedBulkData.blocks）
 */
export function useInterpret(blocks?: Record<string, unknown>): UseInterpretResult {
  return useMemo<UseInterpretResult>(() => {
    const da = (blocks?.DataAnalysis ?? undefined) as AnyRec | undefined;
    if (!da || typeof da !== 'object') return { title: '', items: [] };

    const items: InterpretItem[] = [];
    if (da.CurrentAnalysis && typeof da.CurrentAnalysis === 'object') {
      items.push(mapNode('CurrentAnalysis', da.CurrentAnalysis));
    }
    if (da.NextAnalysis && typeof da.NextAnalysis === 'object') {
      items.push(mapNode('NextAnalysis', da.NextAnalysis));
    }
    return { title: toStr(da.DataTitle, ''), items };
  }, [blocks]);
}
