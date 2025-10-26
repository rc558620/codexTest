import React, { memo } from 'react';
import lastWeek from '@/assets/images/lastWeek@2x.png';
import messageImg from '@/assets/images/sdMessage@2x.png';
import briefReview from '@/assets/images/icon-review@2x.png';
import styles from './index.module.less';

export interface WeeklyNewsCardProps {
  /** 顶部蓝色徽标：后端 Class（本期消息/下期展望） */
  badge?: string;

  /** 供应端 */
  supplyTitle?: string;
  supplyText?: string;

  /** 需求端 */
  demandTitle?: string;
  demandText?: string;

  /** 简评 */
  overviewTitle?: string;
  summaryText?: string;

  className?: string;
  costTitle?: string; // ✅ 新增
  costContent?: string; // ✅ 新增
}

const WeeklyNewsCard: React.FC<WeeklyNewsCardProps> = memo(
  ({
    badge,
    supplyTitle,
    supplyText,
    demandTitle,
    demandText,
    costTitle,
    costContent,
    overviewTitle,
    summaryText,
    className,
  }) => {
    return (
      <section className={[styles.wnc, className].filter(Boolean).join(' ')}>
        {/* 顶部蓝色标签 + 缝线装饰 */}
        <div className={styles.wnc__head}>
          <div className={styles.wnc__badge__box} style={{ backgroundImage: `url(${lastWeek})` }}>
            <div className={styles.wnc__badge}>
              <img src={messageImg} alt="" />
              <span>{badge}</span>
            </div>
          </div>
        </div>

        {/* 两条要点 */}
        <ul className={styles.wnc__list} aria-label="消息要点">
          {costTitle && costContent && (
            <li className={styles.wnc__li}>
              <span className={styles.wnc__dot} aria-hidden />
              <strong className={styles.wnc__label}>{costTitle}：</strong>
              <span className={styles.wnc__text}>{costContent || '—'}</span>
            </li>
          )}
          {supplyTitle && supplyText && (
            <li className={styles.wnc__li}>
              <span className={styles.wnc__dot} aria-hidden />
              <strong className={styles.wnc__label}>{supplyTitle}：</strong>
              <span className={styles.wnc__text}>{supplyText || '—'}</span>
            </li>
          )}
          {demandTitle && demandText && (
            <li className={styles.wnc__li}>
              <span className={styles.wnc__dot} aria-hidden />
              <strong className={styles.wnc__label}>{demandTitle}：</strong>
              <span className={styles.wnc__text}>{demandText || '—'}</span>
            </li>
          )}
        </ul>

        {/* 简评 */}
        <div className={styles.wnc__summary} role="note" aria-label="简评">
          <div className={styles['wnc__summary-title']}>
            <img className={styles['wnc__summary-icon']} src={briefReview} alt="" />
            <span className={styles['wnc__summary-label']}>{overviewTitle}</span>
          </div>
          <p className={styles['wnc__summary-text']}>{summaryText || '—'}</p>
        </div>
      </section>
    );
  },
);

WeeklyNewsCard.displayName = 'WeeklyNewsCard';
export default WeeklyNewsCard;
