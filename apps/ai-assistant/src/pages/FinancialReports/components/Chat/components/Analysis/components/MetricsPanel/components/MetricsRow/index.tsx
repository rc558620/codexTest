import React from 'react';
import cx from 'classnames';

import styles from './index.module.less';
import { MetricItem } from '../../../../types';
import Collapse from '../Collapse';

const isPct = (s: string) => /(率|收益率|比率|ROE|毛利|净利)/.test(s);
const fmt = (label: string, v: number) =>
  v == null || Number.isNaN(v) ? '-' : isPct(label) ? `${v.toFixed(2)}%` : v.toFixed(2);

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={cx(styles.chevron, open && styles.open)}
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden
  >
    <path
      fill="none"
      stroke="rgb(47, 129, 247)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9l6 6 6-6"
    />
  </svg>
);

interface Props {
  item: MetricItem;
  open: boolean;
  onToggle: () => void;
  blueColor: string;
  purpleColor: string;
}

const MetricsRow: React.FC<Props> = ({ item, open, onToggle, blueColor, purpleColor }) => {
  return (
    <div className={styles.row} data-open={open || undefined}>
      <button className={styles.header} onClick={onToggle} type="button" aria-expanded={open}>
        <div className={styles.headerText}>
          <span className={styles.title}>{item.title}</span>
          <span className={styles.subtitle}>{item.subtitle}</span>
        </div>
        <Chevron open={open} />
      </button>

      {/* 使用你现有的 .collapse/.content 样式，不改动 LESS */}
      <Collapse open={open} className={styles.collapse}>
        <div className={styles.content}>
          <div className={styles.badges}>
            <span className={styles.hollow} style={{ borderColor: blueColor }} />
            <span className={styles.badgeText}>2025年中报</span>
          </div>
          <div className={styles.value} style={{ color: blueColor }}>
            {fmt(item.subtitle, item.valueBlue)}
          </div>

          <div className={styles.badges}>
            <span className={styles.hollow} style={{ borderColor: purpleColor }} />
            <span className={styles.badgeText}>行业均价</span>
          </div>
          <div className={styles.value} style={{ color: purpleColor }}>
            {fmt(item.subtitle, item.valuePurple)}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default MetricsRow;
