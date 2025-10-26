import React from 'react';
import classNames from 'classnames';
import { safeStr } from '@/utils/utils';
import styles from '../../../../index.module.less';

export interface BasicProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface GridButtonProps extends BasicProps {
  icon: string; // image src
  title: string;
  desc?: string;
  onClick?: () => void;
}

export const GridButton: React.FC<GridButtonProps> = React.memo(
  ({ className, style, icon, title, desc, onClick }) => (
    <button
      type="button"
      className={classNames(styles['maid-gridbtn'], className)}
      style={style}
      onClick={onClick}
      aria-label={safeStr(title)}
    >
      <div className={styles['maid-gridbtn__icon']}>
        <img className={styles['maid-emoji']} src={icon} alt="" />
      </div>
      <div className={styles['maid-gridbtn__text']}>
        <span className={styles['maid-gridbtn__title']}>{safeStr(title)}</span>
        {desc ? <span className={styles['maid-gridbtn__desc']}>{safeStr(desc)}</span> : null}
      </div>
    </button>
  ),
);

GridButton.displayName = 'GridButton';
