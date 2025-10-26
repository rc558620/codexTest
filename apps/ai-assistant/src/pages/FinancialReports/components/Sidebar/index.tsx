import React from 'react';
import cn from 'classnames';
import styles from './index.module.less';
import { safeStr } from '@/utils/utils';
import { NavItem } from '../../types';

export interface SidebarProps {
  className?: string;
  style?: React.CSSProperties;
  logoText?: string;
  ctaText?: string;
  nav: NavItem[];
  recentTitle?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  style,
  logoText = '财报指标查询助手',
  ctaText = '开启新对话',
  nav,
  recentTitle = '最近对话',
}) => {
  return (
    <div className={cn(styles.sidebar, className)} style={style}>
      <div className={styles.logoRow}>
        <div className={styles.dot} />
        <span className={styles.logo}>{safeStr(logoText)}</span>
      </div>

      <button className={styles.ctaBtn} type="button">
        {safeStr(ctaText)}
      </button>

      <div className={styles.menuTitle}>
        <span className={styles.iconBox} />
        <span>指标库</span>
      </div>

      <div className={styles.recent}>
        <div className={styles.recentHeader}>{safeStr(recentTitle)}</div>
        <ul className={styles.list}>
          {Array.isArray(nav) &&
            nav.length > 0 &&
            nav.map((n, index) => {
              const label = safeStr(n?.label);
              if (!label) return null;
              return (
                <li
                  key={`sidebar-item-${index}`}
                  className={cn(styles.item, n?.active && styles.active)}
                  title={label}
                >
                  <span className={styles.text}>{label}</span>
                  <span className={styles.more}>···</span>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
