import React from 'react';
import cn from 'classnames';
import styles from './index.module.less';
import { safeStr } from '@/utils/utils';
import avatarPlus from '@/assets/images/FinancialReports/avatarPlus@3x.png';

export interface HeaderTitleProps {
  className?: string;
  style?: React.CSSProperties;
  title: string;
  subtitle?: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ className, style, title, subtitle }) => {
  return (
    <div className={cn(styles.wrap, className)} style={style}>
      <img className={styles.img} src={avatarPlus} />
      <h1 className={styles.title}>{safeStr(title)}</h1>
      {subtitle ? <div className={styles.sub}>{safeStr(subtitle)}</div> : null}
    </div>
  );
};

export default HeaderTitle;
