import React, { useMemo } from 'react';
import LastWeek from '../Coal/components/LastWeek';

export interface DesktopMarketPriceAnalysisProps {
  priceTitle: string;
  rows: Array<{
    title: string;
    priceIndex?: string;
    lastAvgPrice: number;
    lastWoW: number; // 0.023 => 2.3%
    lastTitle?: string;
    lastChain?: string; // 如“周环比”
    forecastPrice: number;
    forecastWoW: number;
    forecastTitle?: string;
    forecastChain?: string;
    unit?: string;
    disabled?: boolean;
  }>;
  interpretItems?: Array<{
    key: string;
    className: string; // “本期消息 / 下期展望” —— 直接用于卡片标题
    supplyTitle: string;
    supplyContent: string;
    demandTitle: string;
    demandContent: string;
    overviewTitle: string;
    overviewContent: string; // 简评
    costTitle?: string;
    costContent?: string;
  }>;
}

const DesktopMarketPriceAnalysis: React.FC<DesktopMarketPriceAnalysisProps> = ({
  rows,
  interpretItems = [],
  priceTitle,
}) => {
  const sections = useMemo(() => {
    const norm = (v?: string) => (typeof v === 'string' ? v.trim() : '');

    return interpretItems.map((it) => {
      const analyses = [
        // 1) 成本端分析（优先）
        { label: norm(it.costTitle) || '', value: norm(it.costContent) },
        // 2) 供应端分析
        { label: norm(it.supplyTitle) || '', value: norm(it.supplyContent) },
        // 3) 需求端分析
        { label: norm(it.demandTitle) || '', value: norm(it.demandContent) },
      ]
        // 如果该行 label 与 value 都是空，自动剔除（比如后端没给成本端）
        .filter((row) => row.label || row.value);

      return {
        key: it.key,
        title: norm(it.className) || '',
        analyses,
        brief: norm(it.overviewContent),
        briefTitle: norm(it.overviewTitle),
      };
    });
  }, [interpretItems]);

  return (
    <div className="desktopMarketPriceAnalysis">
      {sections.map((sec) => (
        <LastWeek
          key={sec.key}
          title={sec.title}
          analyses={sec.analyses}
          priceTitle={priceTitle}
          rows={rows}
          briefTitle={sec.briefTitle}
          brief={sec.brief}
          style={{ padding: '16px 16px 0 16px' }}
        />
      ))}
    </div>
  );
};

export default DesktopMarketPriceAnalysis;
