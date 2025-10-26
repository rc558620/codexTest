import React from 'react';
import cx from 'classnames';
import styles from './index.module.less';
import look from '@/assets/images/FinancialReports/lookA.svg';

export interface DatasetCardProps {
  /** 标题 */
  title?: string;
  /** 一级分类（竖线分隔） */
  categories?: string[];
  /** 专题分析条目 */
  topics?: Array<{ text: string; onClick?: () => void; href?: string }>;
  /** 覆盖样式 */
  className?: string;
  style?: React.CSSProperties;
  /** 点击整卡 */
  onClick?: () => void;
}

/** 数据集卡片（高还原） */
const DatasetCard: React.FC<DatasetCardProps> = ({
  title = '云天化财务数据集',
  categories = ['资产负债', '利润', '现金流量', '所有者权益变动'],
  topics = [{ text: '财务分析' }, { text: '对标分析' }],
  className,
  style,
  onClick,
}) => {
  return (
    <section
      role="group"
      aria-label="数据集"
      className={cx(styles.card, className)}
      style={style}
      onClick={onClick}
    >
      {/* 标题行 */}
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <img src={look} className={styles.tipIcon} alt="" />
      </header>

      {/* 分类分隔 */}
      <div className={styles.categoryRow}>
        {categories.map((c, i) => (
          <span key={c} className={styles.categoryItem}>
            {c}
            {i !== categories.length - 1 && (
              <span className={styles.sep} aria-hidden>
                ｜
              </span>
            )}
          </span>
        ))}
      </div>

      {/* 专题分析 */}
      <div className={styles.topicBar}>
        <span className={styles.topicLabel}>专题分析：</span>
        <nav aria-label="专题分析" className={styles.topicLinks}>
          {topics.map((t, i) => {
            const content = <span className={styles.topicLinkText}>{t.text}</span>;
            return t.href ? (
              <a
                key={`${t.text}-${i}`}
                className={styles.topicLink}
                href={t.href}
                onClick={(e) => {
                  // 若同时传了 onClick，阻止默认跳转优先回调
                  if (t.onClick) {
                    e.preventDefault();
                    t.onClick();
                  }
                }}
              >
                {content}
              </a>
            ) : (
              <button
                key={`${t.text}-${i}`}
                type="button"
                className={styles.topicLinkBtn}
                onClick={t.onClick}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
};

export default DatasetCard;
