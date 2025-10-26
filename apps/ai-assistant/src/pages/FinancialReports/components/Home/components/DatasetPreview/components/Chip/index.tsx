import React from 'react';
import cn from 'classnames';
import styles from './index.module.less';
import { safeStr } from '@/utils/utils';

export interface ChipProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Chip: React.FC<ChipProps> = ({ text, className, style, onClick }) => {
  return (
    <button type="button" className={cn(styles.chip, className)} style={style} onClick={onClick}>
      <span className={styles.text}>{safeStr(text)}</span>
    </button>
  );
};

export default Chip;
