import React, { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import styles from './index.module.less';
import interpret from '@/assets/images/icon-interpret@2x.png';
import IconTitle from '../IconTitle';
import CountUp from './components/CountUp';
import { cx, safeNum, safeStr } from '@/utils/utils';

export interface PriceRow {
  title: string;
  priceIndex?: string;
  lastDate?: string;
  lastAvgPrice: number;
  lastWoW: number;
  lastTitle?: string;
  lastChain?: string;
  forecastPrice: number;
  forecastWoW: number;
  forecastTitle?: string;
  forecastDate?: string;
  forecastChain?: string;
  icon?: ReactNode;
  unit?: string;
  disabled?: boolean;
  /** 建议：若有稳定主键可加上它来作为 key 优先使用 */
  id?: string | number;
}

export interface MarketPriceAnalysisProps {
  priceTitle?: string;
  rows: readonly PriceRow[];
  onDeepDive?: () => void;
  deepDiveText?: string;
  className?: string;
  style?: CSSProperties;
  /** 与 ECharts 初始化动画时间保持一致（默认 1000ms） */
  animDurationMs?: number;
}

/** 统一生成涨跌样式/文案/箭头（返回 BEM 修饰符 key，供 CSS Modules 使用） */
const trendMeta = (delta: number) => {
  if (delta < 0) {
    return {
      cls: 'mpa-analysis__trend--down',
      arrow: '↓',
      text: `${(delta * 100).toFixed(2)}%`,
    };
  }
  if (delta > 0) {
    return {
      cls: 'mpa-analysis__trend--up',
      arrow: '↑',
      text: `+${(delta * 100).toFixed(2)}%`,
    };
  }
  return {
    cls: 'mpa-analysis__trend--flat',
    arrow: '—',
    text: '0.00%',
  };
};

const MarketPriceAnalysisNew: React.FC<MarketPriceAnalysisProps> = memo(
  ({
    rows,
    priceTitle,
    onDeepDive,
    deepDiveText = '深入解读',
    className,
    style,
    animDurationMs = 1000,
  }) => {
    const list = Array.isArray(rows) && rows.length > 0 ? rows : [];

    return (
      <section className={cx(styles['mpa-analysis'], className)} style={style}>
        <IconTitle title={priceTitle} style={{ marginTop: -6, paddingBottom: 4 }} />

        <div className={styles['mpa-analysis__list']}>
          {list.map((row, index) => {
            const {
              id,
              title: rowTitle,
              priceIndex,
              lastDate,
              lastChain,
              lastAvgPrice,
              lastWoW,
              lastTitle,
              forecastChain,
              forecastPrice,
              forecastWoW,
              forecastTitle,
              forecastDate,
              unit,
              disabled = false,
            } = row ?? {};

            const safeLastAvgPrice = safeNum(lastAvgPrice);
            const safeLastWoW = safeNum(lastWoW);
            const safeForecastPrice = safeNum(forecastPrice);
            const safeForecastWoW = safeNum(forecastWoW);

            const lastTrend = trendMeta(safeLastWoW);
            const forecastTrend = trendMeta(safeForecastWoW);

            const cardKey =
              (id ?? null) !== null && (id ?? '') !== ''
                ? String(id)
                : (rowTitle && `mpa-card-${rowTitle}`) || `mpa-card-${index}`;

            return (
              <article
                key={cardKey}
                className={cx(
                  styles['mpa-analysis-card'],
                  disabled && styles['mpa-analysis-card--disabled'],
                )}
                aria-disabled={disabled}
              >
                <header className={styles['mpa-analysis__head']}>
                  <h3 className={styles['mpa-analysis__titles']}>{safeStr(rowTitle)}</h3>
                  <div className={styles['mpa-analysis__badge']}>{safeStr(priceIndex)}</div>
                </header>

                <div className={styles['mpa-analysis__panes']}>
                  {/* 左卡：本期 */}
                  <div className={styles['mpa-analysis__pane']}>
                    <div className={cx(styles['mpa-grid__tl'], styles['mpa-analysis__label'])}>
                      <span className={styles.analysis__label__span}>
                        {safeStr(lastTitle, '本期价格')}
                      </span>
                    </div>

                    <div className={styles['mpa-grid__tr']}>
                      <CountUp
                        value={safeLastAvgPrice}
                        durationMs={animDurationMs}
                        playOnce
                        id={`mpa-analysis-${safeStr(rowTitle)}-curr`}
                        decimals={0}
                        className={styles['mpa-analysis__num']}
                      />
                      <span className={styles['mpa-analysis__unit']}>{safeStr(unit, '')}</span>
                    </div>

                    <div className={cx(styles['mpa-grid__bl'], styles['mpa-analysis__date'])}>
                      {safeStr(lastDate)}
                    </div>

                    <div className={styles['mpa-grid__br']}>
                      <span className={styles.lastChain}>{safeStr(lastChain)}</span>
                      <span
                        className={cx(
                          styles['mpa-analysis__trend'],
                          styles[lastTrend.cls], // 应用 up/down/flat 修饰符
                        )}
                      >
                        <span className={styles['mpa-analysis__trend-text']}>{lastTrend.text}</span>
                        <span className={styles['mpa-analysis__trend-arrow']} aria-hidden>
                          {lastTrend.arrow}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 右卡：下期展望 */}
                  <div className={styles['mpa-analysis__pane']}>
                    <div
                      className={cx(
                        styles['mpa-grid__tl'],
                        styles['mpa-analysis__label'],
                        styles.forecastTitle,
                      )}
                    >
                      <span
                        className={cx(styles.analysis__label__span, styles.forecastTitle__span)}
                      >
                        {safeStr(forecastTitle)}
                      </span>
                    </div>

                    <div className={styles['mpa-grid__tr']}>
                      <CountUp
                        value={safeForecastPrice}
                        durationMs={animDurationMs}
                        playOnce
                        id={`mpa-analysis-${safeStr(rowTitle)}-forecast`}
                        decimals={0}
                        className={cx(
                          styles['mpa-analysis__num'],
                          styles['mpa-analysis__num--blue'],
                        )}
                      />
                      <span className={styles['mpa-analysis__unit']}>{safeStr(unit)}</span>
                    </div>

                    <div className={cx(styles['mpa-grid__bl'], styles['mpa-analysis__date'])}>
                      {safeStr(forecastDate)}
                    </div>

                    <div className={styles['mpa-grid__br']}>
                      <span className={styles.lastChain}>{safeStr(forecastChain)}</span>
                      <span
                        className={cx(styles['mpa-analysis__trend'], styles[forecastTrend.cls])}
                      >
                        <span className={styles['mpa-analysis__trend-text']}>
                          {forecastTrend.text}
                        </span>
                        <span className={styles['mpa-analysis__trend-arrow']} aria-hidden>
                          {forecastTrend.arrow}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className={styles['mpa-analysis__deep']}
          onClick={onDeepDive}
          aria-label={deepDiveText}
          disabled={!onDeepDive}
        >
          <img className={styles['mpa-analysis__deep-icon']} src={interpret} alt="" />
          <span className={styles['mpa-analysis__deep-text']}>{deepDiveText}</span>
          <span className={styles['mpa-analysis__deep-arrow']}>›</span>
        </button>
      </section>
    );
  },
);

MarketPriceAnalysisNew.displayName = 'MarketPriceAnalysisNew';
export default MarketPriceAnalysisNew;
