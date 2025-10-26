import React, { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import MobileTitle from '../MobileTitle';
import interpret from '@/assets/images/icon-interpret@2x.png';
import CountUp from '../DesktopMarketPriceAnalysisNew/components/CountUp';
import { cx, safeNum, safeStr } from '@/utils/utils';
import styles from './index.module.less';

export interface PriceRow {
  /** 标题（如：全国合成氨 / 西南合成氨） */
  title: string;
  /** 价格指数徽标文案 */
  priceIndex?: string;

  /** 本期价格-均价 */
  lastAvgPrice: number;
  /** 本期价格-周环比（小数，0.0152 表示 +1.52%） */
  lastWoW: number;
  /** 本期价格-标签（如：本期价格） */
  lastTitle?: string;
  /** 本期价格-环比标签（如：周环比） */
  lastChain?: string;
  /** 本期价格-日期（可选，不展示可忽略） */
  lastDate?: string;

  /** 下期展望-价格 */
  forecastPrice: number;
  /** 下期展望-周环比（小数） */
  forecastWoW: number;
  /** 下期展望-标签（如：下期展望） */
  forecastTitle?: string;
  /** 下期展望-环比标签（如：周环比） */
  forecastChain?: string;
  /** 下期展望-日期（可选） */
  forecastDate?: string;

  /** 备用图标位 */
  icon?: ReactNode;
  /** 单位（如：元/吨） */
  unit?: string;

  /** 禁用态（灰掉卡片） */
  disabled?: boolean;
}

export interface MarketPriceAnalysisProps {
  title?: string;
  rows: readonly PriceRow[];
  onDeepDive?: () => void;
  deepDiveText?: string;
  className?: string;
  style?: CSSProperties;
}

/** 统一涨跌显示 */
const trendMeta = (delta: number) => {
  if (delta < 0)
    return { cls: styles['trend--down'], arrow: '↓', text: `${(delta * 100).toFixed(2)}%` };
  if (delta > 0)
    return { cls: styles['trend--up'], arrow: '↑', text: `+${(delta * 100).toFixed(2)}%` };
  return { cls: styles['trend--flat'], arrow: '—', text: '0.00%' };
};

const MarketPriceAnalysis: React.FC<MarketPriceAnalysisProps> = memo(
  ({ rows, title, onDeepDive, deepDiveText = '深入解读', className, style }) => {
    const animDurationMs = 1000;

    return (
      <section className={cx(styles.mpa, className)} style={style}>
        <MobileTitle title={title} />

        <div className={styles.mpa__list}>
          {Array.isArray(rows) &&
            rows.length > 0 &&
            rows.map((row, x) => {
              const {
                title: rowTitle,
                priceIndex,
                lastAvgPrice,
                lastWoW,
                lastTitle,
                lastChain,
                forecastPrice,
                forecastWoW,
                forecastTitle,
                forecastChain,
                unit,
                disabled = false,
              } = row;

              const safeLastAvgPrice = safeNum(lastAvgPrice);
              const safeLastWoW = safeNum(lastWoW);
              const safeForecastPrice = safeNum(forecastPrice);
              const safeForecastWoW = safeNum(forecastWoW);

              const lastTrend = trendMeta(safeLastWoW);
              const forecastTrend = trendMeta(safeForecastWoW);

              return (
                <article
                  key={rowTitle || `mpa-fallback-key-${x}`}
                  className={cx(styles['mpa-card'], disabled && styles['mpa-card--disabled'])}
                  aria-disabled={disabled}
                >
                  <header className={styles.mpa__head}>
                    <h3 className={styles.mpa__titles}>{safeStr(rowTitle)}</h3>
                    <div className={styles.mpa__badge}>{safeStr(priceIndex)}</div>
                  </header>

                  <div className={styles.mpa__panes}>
                    {/* ===== 本期价格 ===== */}
                    <div className={styles.mpa__pane}>
                      <div className={cx(styles.stat__row, styles['stat__row--price'])}>
                        {/* 左：标签 + 价格/单位 */}
                        <div className={styles.stat__left}>
                          <div className={styles.mpa__label}>{safeStr(lastTitle)}</div>
                          <div className={styles['stat__num--box']}>
                            <CountUp
                              value={safeLastAvgPrice}
                              durationMs={animDurationMs}
                              playOnce
                              id={`mpa-last-${safeStr(rowTitle)}`}
                              decimals={0}
                              className={styles.stat__num}
                            />
                            <span className={styles.mpa__unit}>{safeStr(unit)}</span>
                          </div>
                        </div>

                        {/* 右：周环比 + 涨跌幅 */}
                        <div className={styles.stat__right}>
                          <span className={styles.stat__split}>{safeStr(lastChain)}</span>
                          <span className={cx(styles.trend, lastTrend.cls)}>
                            <span className={styles.trend__text}>{lastTrend.text}</span>
                            <span className={styles.trend__arrow} aria-hidden>
                              {lastTrend.arrow}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ===== 下期展望 ===== */}
                    <div className={styles.mpa__pane}>
                      <div className={cx(styles.stat__row, styles['stat__row--price'])}>
                        {/* 左：标签 + 价格/单位 */}
                        <div className={styles.stat__left}>
                          <div className={styles.mpa__label}>{safeStr(forecastTitle)}</div>
                          <div className={styles['stat__num--box']}>
                            <CountUp
                              value={safeForecastPrice}
                              durationMs={animDurationMs}
                              playOnce
                              id={`mpa-forecast-${safeStr(rowTitle)}`}
                              decimals={0}
                              className={cx(styles.stat__num, styles['stat__num--blue'])}
                            />
                            <span className={styles.mpa__unit}>{safeStr(unit)}</span>
                          </div>
                        </div>

                        {/* 右：周环比 + 涨跌幅 */}
                        <div className={styles.stat__right}>
                          <span className={styles.stat__split}>{safeStr(forecastChain)}</span>
                          <span className={cx(styles.trend, forecastTrend.cls)}>
                            <span className={styles.trend__text}>{forecastTrend.text}</span>
                            <span className={styles.trend__arrow} aria-hidden>
                              {forecastTrend.arrow}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        <button
          type="button"
          className={styles.mpa__deep}
          onClick={onDeepDive}
          aria-label={deepDiveText}
          disabled={!onDeepDive}
        >
          <img className={styles['mpa__deep-icon']} src={interpret} alt="" />
          <span className={styles['mpa__deep-text']}>{deepDiveText}</span>
          <span className={styles['mpa__deep-arrow']}>›</span>
        </button>
      </section>
    );
  },
);

MarketPriceAnalysis.displayName = 'MarketPriceAnalysis';
export default MarketPriceAnalysis;
