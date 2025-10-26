import React from 'react';
import classNames from 'classnames';
import './index.less';
import lastWeek from '@/assets/images/lastWeek.png';
import review from '@/assets/images/icon-review@2x.png';

export interface PriceRow {
  title: string;
  priceIndex?: string;
  lastAvgPrice: number;
  lastWoW: number; // 小数：0.023
  lastTitle?: string;
  lastChain?: string; // 文案：周环比（兜底）
  forecastPrice: number;
  forecastWoW: number;
  forecastTitle?: string;
  forecastChain?: string;
  unit?: string;
  disabled?: boolean;
}

type DeltaTone = 'up' | 'down' | 'flat';

export interface AnalysisItem {
  label: string;
  value: React.ReactNode;
}

export interface LastWeekProps {
  title?: string; // 直接用 interpretItems[i].className
  analyses: AnalysisItem[]; // 供应端 / 需求端
  rows: PriceRow[]; // 价格卡片循环
  brief: string; // 简评
  briefTitle: string;
  priceTitle: string; // “市场价格分析”标题（后端 DataTitle）
  className?: string;
  style?: React.CSSProperties;
}

const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString('zh-CN', { maximumFractionDigits: 2 }) : '--';

const toneOf = (v: number): { tone: DeltaTone; arrow: string; signed: string } => {
  if (v > 0) return { tone: 'up', arrow: '↑', signed: `+${v.toFixed(2)}%` };
  if (v < 0) return { tone: 'down', arrow: '↓', signed: `${v.toFixed(2)}%` };
  return { tone: 'flat', arrow: '—', signed: '0.00%' };
};

// 兜底：非法数值 → 0
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

const LastWeek: React.FC<LastWeekProps> = ({
  title,
  analyses,
  rows,
  brief,
  briefTitle,
  priceTitle,
  className,
  style,
}) => {
  return (
    <section className={classNames('lw', className)} style={style}>
      {/* 头部 */}
      <header className="lw__head">
        <div className="lw__title">{title}</div>
      </header>

      <div className="lw__body">
        {/* 分析条目（供应/需求） */}
        <ul className="lw__list">
          {Array.isArray(analyses) &&
            analyses.map((item, index) => {
              const key = item?.label ? `analysis-${item.label}` : `analysis-${index}`;
              return (
                <li key={key} className="lw__li">
                  <span className="lw__dot" aria-hidden />
                  <div className="lw__li-wrap">
                    <span className="lw__li-label">{item?.label ?? ''}：</span>
                    <span className="lw__li-text">{item?.value ?? ''}</span>
                  </div>
                </li>
              );
            })}
        </ul>

        {/* 市场价格分析：rows 循环（仅用本期 last* 字段） */}
        <div className="lw__section">
          <div className="lw__section-title">{priceTitle}：</div>
          <div className="lw__cards">
            {Array.isArray(rows) &&
              rows
                .filter((r) => !r.disabled)
                .map((r, idx) => {
                  const value = num(r.lastAvgPrice);
                  const wowPct = num(r.lastWoW) * 100;
                  const unit = r.unit || '';
                  const wowLabel = r.lastChain || '';
                  const tone = toneOf(wowPct);
                  const cardTitle = r.title + (r.priceIndex ? ` ${r.priceIndex}` : '');

                  return (
                    <div className="lw__card" key={`${r.title}-${idx}`}>
                      <div className="lw__card-line">
                        <div className="lw__card-title">{cardTitle}</div>
                        <div className="lw__card-line-div">
                          <span className="lw__card-num">{fmt(value)}</span>
                          <span className="lw__unit">{unit}</span>
                          <span className="lw__wow">
                            {wowLabel}
                            <b className={classNames('lw__wow-num', `is-${tone.tone}`)}>
                              {tone.signed} <i aria-hidden>{tone.arrow}</i>
                            </b>
                          </span>
                        </div>
                      </div>
                      <img className="lw__card-img" src={lastWeek} alt="" />
                    </div>
                  );
                })}
          </div>
        </div>

        {/* 简评 */}
        <div className="lw__brief">
          <img className="lw__brief-icon" src={review} alt="" />
          <span className="lw__brief-label">{briefTitle}：</span>
          <span className="lw__brief-text">{brief}</span>
        </div>
      </div>
    </section>
  );
};

export default LastWeek;
