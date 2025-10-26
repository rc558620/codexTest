import React from 'react';
import classNames from 'classnames';
import { safeStr } from '@/utils/utils';
import styles from '../../../../index.module.less';

export interface BasicProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface ChipProps extends BasicProps {
  text: string;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ className, style, text, onClick }) => (
  <button
    type="button"
    className={classNames(styles['maid-chip'], className)}
    style={style}
    onClick={onClick}
    aria-label={safeStr(text)}
  >
    <span className={styles['maid-chip__text']}>{safeStr(text)}</span>
  </button>
);
