import React from 'react';
import styles from './index.module.less';

interface IconTitleProps {
  title?: string;
  style?: React.CSSProperties;
}

const IconTitle: React.FC<IconTitleProps> = ({ title, style }) => {
  return (
    <div className={styles['app-icon-title__head']} style={style}>
      {/* <span className={styles['app-icon-title__dot']} /> */}
      <h3 className={styles['app-icon-title__title']}>{title}</h3>
    </div>
  );
};

export default IconTitle;
